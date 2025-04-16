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

  const [activeTab, setActiveTab] = useState<"menu" | "orders">("menu");
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
      <div className="mb-10">
        {loadingEvent ? (
          <span className="text-sm font-normal">Caricamento evento...</span>
        ) : errorEvent ? (
          <span className="text-sm font-normal text-red-500">
            Errore nel caricamento evento
          </span>
        ) : (
          <h1>
            <span className="font-bold text-5xl">
              {event?.title || `#${eventId}`}
            </span>{" "}
            <span className="font-normal text-base">{formattedDate}</span>
          </h1>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-4 border-b mb-4">
        <button
          onClick={() => setActiveTab("menu")}
          className={`p-2 ${
            activeTab === "menu" ? "border-b-2 border-blue-500" : ""
          }`}
        >
          Menu
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`p-2 ${
            activeTab === "orders" ? "border-b-2 border-blue-500" : ""
          }`}
        >
          Ordini
        </button>
      </div>

      {/* Tab Menu */}
      {activeTab === "menu" && (
        <div>
          <h2 className="text-xl font-bold mb-2">Gestione Menu</h2>

          <MenuManager eventId={eventId} menu={menu} mutate={mutateOrders} />
        </div>
      )}

      {/* Tab Ordini */}
      {activeTab === "orders" && (
        <div className="grid grid-cols-3 gap-5">
          {/* Colonna 1: Portate Disponibili */}
          <div>
            <h2 className="text-xl font-bold mb-2"> Portate Disponibili </h2>

            {menu.length === 0 ? (
              <p>Nessuna portata trovata.</p>
            ) : (
              Object.entries(groupedMenu).map(([categoryName, items]) => (
                <div key={categoryName} className="mt-4">
                  <h3 className="text-lg font-bold bg-foreground/10 py-1px-4">
                    {categoryName}
                  </h3>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleAddToCart(item)}
                      disabled={item.terminated}
                      className={`block w-full px-4 py-2 mb-2 ${
                        item.terminated
                          ? "bg-gray-500 cursor-not-allowed"
                          : "border hover:bg-foreground/5 "
                      }`}
                    >
                      {item.title} - €{item.price}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Colonna 2: Carrello (portate selezionate) */}
          <div>
            <h2 className="text-xl font-bold mb-2">Carrello</h2>
            <input
              className="border p-2 w-full mb-2"
              placeholder="Nome Cliente"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            {selectedItems.length === 0 ? (
              <p>Carrello vuoto.</p>
            ) : (
              selectedItems.map((item, index) => (
                <div key={index} className="border p-2 mb-1">
                  {item.title} - €{item.price}
                </div>
              ))
            )}
            <div className="mt-4 font-bold">Totale: €{total.toFixed(2)}</div>
            <button
              onClick={handleCreateOrder}
              className="bg-blue-500 text-white px-4 py-2 mt-2 w-full"
            >
              Crea Ordine
            </button>
            {orderError && <p className="text-red-500 mt-2">{orderError}</p>}
          </div>

          {/* Colonna 3: Ordini Effettuati */}
          <div>
            <h2 className="text-xl font-bold mb-2">Ordini Effettuati</h2>
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
          <div className="bg-gray-800 p-6 rounded w-96">
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
          </div>
        </div>
      )}
    </div>
  );
}
