"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

interface Event {
  id: number;
  title: string;
  date: string;
}

export interface MenuItem {
  id: number;
  event_id: number;
  title: string;
  price: number;
}

export interface Order {
  id: number;
  event_id: number;
  items: MenuItem[];
  total: number;
  customer: string;
}

interface OrderContextType {
  events: Event[];
  menu: MenuItem[];
  orders: Order[];
  currentOrder: MenuItem[];
  selectedEvent: Event | null;
  addEvent: (title: string, date: string) => void;
  addMenuItem: (title: string, price: number) => void;
  addToOrder: (item: MenuItem) => void;
  completeOrder: (customer: string) => void;
  setSelectedEvent: (event: Event | null) => void;
  fetchMenu: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<MenuItem[]>([]);

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase.from("events").select("*");
      if (data) setEvents(data);
    }
    fetchEvents();
  }, []);

  async function addEvent(title: string, date: string) {
    const { data } = await supabase
      .from("events")
      .insert([{ title, date }])
      .select("*");
    if (data) setEvents([...events, ...data]);
  }

  async function addMenuItem(title: string, price: number) {
    if (!selectedEvent) return;
    const { data } = await supabase
      .from("menu")
      .insert([{ event_id: selectedEvent.id, title, price }])
      .select("*");
    if (data) {
      setMenu([...menu, ...data]);
    }
  }

  function addToOrder(item: MenuItem) {
    setCurrentOrder([...currentOrder, item]);
  }

  async function completeOrder(customer: string) {
    if (!selectedEvent) return;
    const total = currentOrder.reduce((acc, item) => acc + item.price, 0);
    const { data, error } = await supabase
      .from("orders")
      .insert([
        { event_id: selectedEvent.id, items: currentOrder, total, customer },
      ])
      .select("*");
    if (error) {
      console.error("Errore nella creazione dell'ordine:", error);
    } else if (data) {
      setOrders([...orders, ...data]);
    }
    // Svuota il carrello
    setCurrentOrder([]);
  }

  // Funzione per recuperare il menu relativo all'evento
  async function fetchMenu() {
    if (!selectedEvent) return;
    const { data, error } = await supabase
      .from("menu")
      .select("*")
      .eq("event_id", selectedEvent.id);
    if (error) {
      console.error("Errore nel fetch del menu:", error);
    } else if (data) {
      setMenu(data);
    }
  }

  return (
    <OrderContext.Provider
      value={{
        events,
        menu,
        orders,
        currentOrder,
        selectedEvent,
        addEvent,
        addMenuItem,
        addToOrder,
        completeOrder,
        setSelectedEvent,
        fetchMenu,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrderContext() {
  const context = useContext(OrderContext);
  if (!context)
    throw new Error("useOrderContext must be used within an OrderProvider");
  return context;
}
