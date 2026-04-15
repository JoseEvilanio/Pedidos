import { create } from 'zustand';
import { supabase } from '../supabase';
import { v4 as uuidv4 } from 'uuid';

const SHIRT_PRICE = 120;

export const useStore = create((set, get) => ({
  departments: [],
  orders: [],
  installments: [],
  isLoaded: false,
  isSubscribed: false,

  // Called once inside App.jsx to attach listeners
  initSupabaseListeners: async () => {
    if (get().isSubscribed) return;
    set({ isSubscribed: true });

    // 1. Initial state
    const [deptRes, ordRes, instRes] = await Promise.all([
      supabase.from('departments').select('*'),
      supabase.from('orders').select('*'),
      supabase.from('installments').select('*')
    ]);

    set({ 
      departments: deptRes.data || [], 
      orders: ordRes.data || [], 
      installments: instRes.data || [],
      isLoaded: true 
    });

    // 2. Realtime subscriptions
    supabase.channel('public-tables')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'departments' }, (payload) => {
        const current = get().departments;
        if (payload.eventType === 'INSERT') set({ departments: [...current, payload.new] });
        if (payload.eventType === 'UPDATE') set({ departments: current.map(d => d.id === payload.new.id ? payload.new : d) });
        if (payload.eventType === 'DELETE') set({ departments: current.filter(d => d.id !== payload.old.id) });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        const current = get().orders;
        if (payload.eventType === 'INSERT') set({ orders: [...current, payload.new] });
        if (payload.eventType === 'UPDATE') set({ orders: current.map(o => o.id === payload.new.id ? payload.new : o) });
        if (payload.eventType === 'DELETE') set({ orders: current.filter(o => o.id !== payload.old.id) });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'installments' }, (payload) => {
        const current = get().installments;
        if (payload.eventType === 'INSERT') set({ installments: [...current, payload.new] });
        if (payload.eventType === 'UPDATE') set({ installments: current.map(i => i.id === payload.new.id ? payload.new : i) });
        if (payload.eventType === 'DELETE') set({ installments: current.filter(i => i.id !== payload.old.id) });
      })
      .subscribe();
  },

  // Departments
  addDepartment: async (name, responsibleName) => {
    const id = uuidv4();
    await supabase.from('departments').insert([{
      id,
      name,
      responsibleName
    }]);
  },

  // Orders
  addOrder: async (departmentId, personName, items, paymentMethod, installmentsCount) => {
    const totalQuantity = Object.values(items).reduce((acc, qty) => acc + (parseInt(qty) || 0), 0);
    const totalAmount = totalQuantity * SHIRT_PRICE;
    
    if (totalQuantity === 0) return;

    const orderId = uuidv4();
    const newOrder = {
      id: orderId,
      departmentId,
      personName,
      items,
      totalAmount,
      paymentMethod,
      createdAt: new Date().toISOString()
    };

    // Save order
    await supabase.from('orders').insert([newOrder]);

    // Save installments sequentially
    if (paymentMethod === 'vista') {
      const instId = uuidv4();
      await supabase.from('installments').insert([{
        id: instId,
        orderId,
        amount: totalAmount,
        dueDate: new Date().toISOString(),
        isPaid: false,
        paidAt: null,
        index: 1
      }]);
    } else {
      const count = Math.min(Math.max(installmentsCount || 1, 1), 6);
      const amountPerInstallment = totalAmount / count;
      const installmentsToInsert = [];
      
      for (let i = 0; i < count; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() + i);
        const instId = uuidv4();
        
        installmentsToInsert.push({
          id: instId,
          orderId,
          amount: amountPerInstallment,
          dueDate: date.toISOString(),
          isPaid: false,
          paidAt: null,
          index: i + 1
        });
      }
      
      await supabase.from('installments').insert(installmentsToInsert);
    }
  },

  // Pagamentos
  payInstallment: async (installmentId) => {
    // Atualização otimista: UI responde instantaneamente
    const now = new Date().toISOString();
    set({
      installments: get().installments.map(i =>
        i.id === installmentId ? { ...i, isPaid: true, paidAt: now } : i
      )
    });
    // Persiste no Supabase em segundo plano
    await supabase.from('installments').update({
      isPaid: true,
      paidAt: now
    }).eq('id', installmentId);
  }
}));
