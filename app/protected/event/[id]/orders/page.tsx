"use client";
import OrderList from "@/components/OrderList";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useOrders } from "@/hooks/useOrders";
import { useMenu } from "@/hooks/useMenu";
import { useToast } from "@/hooks/use-toast";
import { createOrder, updateOrder } from "@/lib/supabase";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function OrdersPage() {
  const { toast } = useToast();
  const { id } = useParams();
  const eventId = Number(id);
  const [customerName, setCustomerName] = useState("");
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [orderError, setOrderError] = useState("");
  // Stato per il modal di modifica ordine
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingCustomer, setEditingCustomer] = useState("");
  const [editingItems, setEditingItems] = useState<any[]>([]);

  const { menu, isLoading: loadingMenu, error: errorMenu } = useMenu(eventId);
  const {
    orders,
    isLoading: loadingOrders,
    error: errorOrders,
    mutate: mutateOrders,
  } = useOrders(eventId);
  if (loadingMenu || loadingOrders) return <p>Caricamento...</p>;
  if (errorMenu)
    return <p>Errore nel caricamento del menu: {errorMenu.message}</p>;
  if (errorOrders)
    return <p>Errore nel caricamento degli ordini: {errorOrders.message}</p>;

  interface Order {
    id: number;
    customer_name: string;
    items: any[];
    total: number;
  }

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
      toast({ description: "Ordine creato con successo!" });
    } catch (err: any) {
      setOrderError("Errore nella creazione dell'ordine!");
      console.error(err);
    }
  }

  // Apertura del modal di modifica per un ordine
  function openEditModal(order: Order) {
    setEditingOrder(order);
    setEditingCustomer(order.customer_name);
    setEditingItems(order.items);
  }

  // Modifica delle portate nell'ordine in modifica (toggle per ogni portata)
  function toggleEditingItem(item: any) {
    setEditingItems((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  }

  // Salva le modifiche ad un ordine
  async function handleUpdateOrder() {
    if (!editingCustomer.trim()) {
      toast({ description: "Inserisci il nome del cliente!" });
      return;
    }
    if (editingItems.length === 0) {
      toast({ description: "Seleziona almeno una portata per l'ordine!" });
      return;
    }
    try {
      await updateOrder(editingOrder!.id, editingCustomer, editingItems);
      mutateOrders();
      setEditingOrder(null);
      toast({ description: "Ordine aggiornato con successo!" });
    } catch (err: any) {
      toast({ description: "Errore nell'aggiornamento dell'ordine!" });
      console.error(err);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Lista Ordini</h1>
      {/* <OrderList eventId={1} /> */}
      <Dialog>
        {orders.length === 0 ? (
          <p>Nessun ordine effettuato.</p>
        ) : (
          orders
            .sort((a, b) => b.id - a.id)
            .map((order) => (
              <div
                key={order.id}
                className="border p-2 mb-2 flex justify-between items-center"
              >
                <div>
                  <p>
                    <strong>Ordine #{order.id}</strong> - {order.customer_name}
                  </p>
                  <p className="text-gray-500">
                    Totale: €{order.total.toFixed(2)}
                  </p>
                </div>
                {/* <button
                              onClick={() => openEditModal(order)}
                              className="bg-yellow-500 text-white px-2 py-1 rounded"
                            >
                              Modifica
                            </button> */}
                <DialogTrigger onClick={() => openEditModal(order)}>
                  Modifica
                </DialogTrigger>
              </div>
            ))
        )}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Ordine #{editingOrder?.id}</DialogTitle>
            <DialogDescription>
              <input
                type="text"
                placeholder="Nome Cliente"
                className="border p-2 w-full mb-2"
                value={editingCustomer}
                onChange={(e) => setEditingCustomer(e.target.value)}
              />
              <h3 className="font-bold mb-2">Seleziona Portate</h3>
              {menu.map((item) => (
                <div key={item.id} className="flex items-center gap-2 mb-1">
                  <label className={item.terminated ? "opacity-45" : ""}>
                    <input
                      type="checkbox"
                      checked={editingItems.some((i) => i.id === item.id)}
                      onChange={() => toggleEditingItem(item)}
                      disabled={item.terminated}
                    />
                    {item.title} - €{item.price}
                  </label>
                </div>
              ))}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  onClick={() => setEditingOrder(null)}
                >
                  Annulla
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={handleUpdateOrder}
                >
                  Salva Modifiche
                </button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
