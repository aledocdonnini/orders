"use client";

import { useState } from "react";
import { useMenu } from "@/hooks/useMenu";
import { useOrders } from "@/hooks/useOrders";
import { createOrder } from "@/lib/supabase"; // Funzione per creare l'ordine
import { useParams } from "next/navigation";
import { toast } from "react-toastify";

export default function EventPage() {
  const { id } = useParams();
  const eventId = Number(id);
  const {
    menu,
    isLoading: loadingMenu,
    error: errorMenu,
    mutate: mutateMenu,
  } = useMenu(eventId);
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

  if (loadingMenu || loadingOrders) return <p>Caricamento...</p>;
  if (errorMenu)
    return <p>Errore nel caricamento del menu: {errorMenu.message}</p>;
  if (errorOrders)
    return <p>Errore nel caricamento degli ordini: {errorOrders.message}</p>;

  // Aggiunge o rimuove una portata dall'ordine
  function toggleItemSelection(item: any) {
    setSelectedItems((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  }

  // Salva il nuovo ordine
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
      // Aggiorna gli ordini e il menu se necessario
      mutateOrders();
      setCustomerName("");
      setSelectedItems([]);
      setOrderError("");
      toast.success("Ordine creato con successo!");
    } catch (err: any) {
      setOrderError("Errore nella creazione dell'ordine!");
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

          <h2 className="text-xl font-bold mt-6 mb-2">Ordini Effettuati</h2>
          {orders.length === 0 ? (
            <p>Nessun ordine effettuato.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="border p-2 mb-2">
                <p>
                  <strong>Ordine #{order.id}</strong> - {order.customer_name}
                </p>
                <p className="text-gray-500">
                  Totale: €{order.total.toFixed(2)}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
