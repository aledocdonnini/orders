"use client";

import { useState } from "react";
import { useMenu } from "@/hooks/useMenu";
import { useOrders } from "@/hooks/useOrders";
import { useCategories } from "@/hooks/useCategories";
import { useEvent } from "@/hooks/useEvent";
import { createOrder, updateOrder } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import MenuManager from "@/components/MenuManager";
import { formatDate } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Order {
  id: number;
  customer_name: string;
  items: any[];
  total: number;
}

export default function EventPage() {
  const { id } = useParams();
  const eventId = Number(id);
  const {
    event,
    isLoading: loadingEvent,
    error: errorEvent,
  } = useEvent(eventId);

  const formattedDate = formatDate(event?.date);

  const { menu, isLoading: loadingMenu, error: errorMenu } = useMenu(eventId);
  const {
    orders,
    isLoading: loadingOrders,
    error: errorOrders,
    mutate: mutateOrders,
  } = useOrders(eventId);

  const {
    categories,
    isLoading: loadingCategories,
    error: errorCategories,
  } = useCategories(eventId);

  // const [activeTab, setActiveTab] = useState<"menu" | "orders">("menu");
  const [customerName, setCustomerName] = useState("");
  // Per il nuovo ordine (carrello), ora supportiamo duplicati
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [orderError, setOrderError] = useState("");

  // Stato per il modal di modifica ordine
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingCustomer, setEditingCustomer] = useState("");
  const [editingItems, setEditingItems] = useState<any[]>([]);

  if (loadingMenu || loadingOrders) return <p>Caricamento...</p>;
  if (errorMenu)
    return <p>Errore nel caricamento del menu: {errorMenu.message}</p>;
  if (errorOrders)
    return <p>Errore nel caricamento degli ordini: {errorOrders.message}</p>;

  // Aggiunge una portata al carrello (può essere lo stesso item più volte)
  function handleAddToCart(item: any) {
    if (item.terminated) return; // non aggiungere se terminata
    setSelectedItems((prev) => [...prev, item]);
  }

  // Calcola il totale dell'ordine corrente
  const total = selectedItems.reduce((sum, item) => sum + item.price, 0);

  // Funzione per creare un nuovo ordine
  async function handleCreateOrder() {
    if (!customerName.trim()) {
      setOrderError("Devi inserire il nome del cliente!");
      return;
    }
    if (selectedItems.length === 0) {
      setOrderError("Devi selezionare almeno una portata!");
      return;
    }
    try {
      await createOrder(eventId, customerName, selectedItems);
      mutateOrders(); // Aggiorna gli ordini
      setCustomerName("");
      setSelectedItems([]);
      setOrderError("");
      toast.success("Ordine creato con successo!");
    } catch (err: any) {
      setOrderError("Errore nella creazione dell'ordine!");
      console.error(err);
    }
  }

  // // Apertura del modal di modifica per un ordine
  // function openEditModal(order: Order) {
  //   setEditingOrder(order);
  //   setEditingCustomer(order.customer_name);
  //   setEditingItems(order.items);
  // }

  // // Modifica delle portate nell'ordine in modifica (toggle per ogni portata)
  // function toggleEditingItem(item: any) {
  //   setEditingItems((prev) =>
  //     prev.some((i) => i.id === item.id)
  //       ? prev.filter((i) => i.id !== item.id)
  //       : [...prev, item]
  //   );
  // }

  // Salva le modifiche ad un ordine
  // async function handleUpdateOrder() {
  //   if (!editingCustomer.trim()) {
  //     toast.error("Inserisci il nome del cliente!");
  //     return;
  //   }
  //   if (editingItems.length === 0) {
  //     toast.error("Seleziona almeno una portata per l'ordine!");
  //     return;
  //   }
  //   try {
  //     await updateOrder(editingOrder!.id, editingCustomer, editingItems);
  //     mutateOrders();
  //     setEditingOrder(null);
  //     toast.success("Ordine aggiornato con successo!");
  //   } catch (err: any) {
  //     toast.error("Errore nell'aggiornamento dell'ordine!");
  //     console.error(err);
  //   }
  // }

  const categoryMap = categories.reduce<Record<number, string>>((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {});
  const groupedMenu = menu.reduce<Record<string, any[]>>((acc, item) => {
    const categoryName = categoryMap[item.category_id] || "Senza categoria";
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(item);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-5 ">
        {loadingEvent ? (
          <span className="text-sm font-normal">Caricamento evento...</span>
        ) : errorEvent ? (
          <span className="text-sm font-normal text-red-500">
            Errore nel caricamento evento
          </span>
        ) : (
          <h1 className="flex justify-between items-center">
            <span className=" font-bold text-5xl">
              {event?.title || `#${eventId}`}
            </span>
            <span className="font-normal text-base">{formattedDate}</span>
          </h1>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Gestione Menu</h2>

        <MenuManager eventId={eventId} menu={menu} mutate={mutateOrders} />
      </div>
    </div>
  );
}
