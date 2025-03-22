"use client";

import { useState } from "react";
import { useMenu } from "@/hooks/useMenu";
import { useOrders } from "@/hooks/useOrders";
import { createOrder, updateOrder } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";

interface Order {
  id: number;
  customer_name: string;
  items: any[];
  total: number;
}

export default function EventPage() {
  const { id } = useParams();
  const eventId = Number(id);
  const { menu, isLoading: loadingMenu, error: errorMenu } = useMenu(eventId);
  const {
    orders,
    isLoading: loadingOrders,
    error: errorOrders,
    mutate: mutateOrders,
  } = useOrders(eventId);

  const [activeTab, setActiveTab] = useState<"menu" | "orders">("menu");
  const [customerName, setCustomerName] = useState("");
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [orderError, setOrderError] = useState("");

  // Stato per la modifica di un ordine
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingCustomer, setEditingCustomer] = useState("");
  const [editingItems, setEditingItems] = useState<any[]>([]);

  if (loadingMenu || loadingOrders) return <p>Caricamento...</p>;
  if (errorMenu)
    return <p>Errore nel caricamento del menu: {errorMenu.message}</p>;
  if (errorOrders)
    return <p>Errore nel caricamento degli ordini: {errorOrders.message}</p>;

  // Funzione per aggiungere o rimuovere una portata dall'ordine in creazione
  function toggleItemSelection(item: any) {
    setSelectedItems((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
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
      toast.success("Ordine creato con successo!");
    } catch (err: any) {
      setOrderError("Errore nella creazione dell'ordine!");
      console.error(err);
    }
  }

  // Funzione per aprire il modal di modifica per un ordine
  function openEditModal(order: Order) {
    setEditingOrder(order);
    setEditingCustomer(order.customer_name);
    setEditingItems(order.items);
  }

  // Funzione per gestire la modifica degli elementi dell'ordine in modifica
  function toggleEditingItem(item: any) {
    setEditingItems((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  }

  // Funzione per salvare le modifiche ad un ordine
  async function handleUpdateOrder() {
    if (!editingCustomer.trim()) {
      toast.error("Inserisci il nome del cliente!");
      return;
    }
    if (editingItems.length === 0) {
      toast.error("Seleziona almeno una portata per l'ordine!");
      return;
    }
    try {
      await updateOrder(editingOrder!.id, editingCustomer, editingItems);
      mutateOrders();
      setEditingOrder(null);
      toast.success("Ordine aggiornato con successo!");
    } catch (err: any) {
      toast.error("Errore nell'aggiornamento dell'ordine!");
      console.error(err);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Gestione Evento #{eventId}</h1>

      {/* Tab Switcher */}
      <div className="flex gap-4 border-b mb-4">
        <button
          onClick={() => setActiveTab("menu")}
          className={`p-2 ${activeTab === "menu" ? "border-b-2 border-blue-500" : ""}`}
        >
          Menu
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`p-2 ${activeTab === "orders" ? "border-b-2 border-blue-500" : ""}`}
        >
          Ordini
        </button>
      </div>

      {/* Tab Menu */}
      {activeTab === "menu" && (
        <div>
          <h2 className="text-xl font-bold mb-2">Portate disponibili</h2>
          {menu.length === 0 ? (
            <p>Nessuna portata trovata per questo evento.</p>
          ) : (
            menu.map((item) => (
              <div key={item.id} className="border p-2 mb-2">
                {item.title} - €{item.price}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Ordini */}
      {activeTab === "orders" && (
        <div className="grid grid-cols-2 gap-5">
          <div>
            <h2 className="text-xl font-bold mb-2">Nuovo Ordine</h2>
            <input
              className="border p-2 w-full mb-2"
              placeholder="Nome Cliente"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            {menu.map((item) => (
              <div key={item.id} className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  checked={selectedItems.some((i) => i.id === item.id)}
                  onChange={() => toggleItemSelection(item)}
                />
                <span>
                  {item.title} - €{item.price}
                </span>
              </div>
            ))}
            {orderError && <p className="text-red-500">{orderError}</p>}
            <button
              onClick={handleCreateOrder}
              className="bg-blue-500 text-white px-4 py-2 mt-2"
            >
              Crea Ordine
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold mt-6 mb-2">Ordini Effettuati</h2>
            {orders.length === 0 ? (
              <p>Nessun ordine effettuato.</p>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="border p-2 mb-2 flex justify-between items-center"
                >
                  <div>
                    <p>
                      <strong>Ordine #{order.id}</strong> -{" "}
                      {order.customer_name}
                    </p>
                    <p className="text-gray-500">
                      Totale: €{order.total.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => openEditModal(order)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Modifica
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal per la modifica dell'ordine */}
      {editingOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">
              Modifica Ordine #{editingOrder.id}
            </h2>
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
                <input
                  type="checkbox"
                  checked={editingItems.some((i) => i.id === item.id)}
                  onChange={() => toggleEditingItem(item)}
                />
                z
                <span>
                  {item.title} - €{item.price}
                </span>
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
          </div>
        </div>
      )}
    </div>
  );
}
