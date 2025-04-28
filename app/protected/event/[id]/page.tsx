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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
      <Sheet>
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

        {/* Tab Switcher */}
        <Tabs defaultValue="menu" className="">
          <div className="flex gap-4 border-b mb-4">
            <TabsList>
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="orders">Ordini</TabsTrigger>
            </TabsList>

            <div className="ml-auto">
              <SheetTrigger>Ordini effettuati</SheetTrigger>
            </div>
          </div>

          <TabsContent value="menu">
            <div>
              <h2 className="text-xl font-bold mb-2">Gestione Menu</h2>

              <MenuManager
                eventId={eventId}
                menu={menu}
                mutate={mutateOrders}
              />
            </div>
          </TabsContent>
          <TabsContent value="orders">
            <div className="grid grid-cols-2 gap-5">
              {/* Colonna 1: Portate Disponibili */}
              <div>
                <h2 className="text-xl font-bold mb-2">
                  {" "}
                  Portate Disponibili{" "}
                </h2>

                {menu.length === 0 ? (
                  <p>Nessuna portata trovata.</p>
                ) : (
                  Object.entries(groupedMenu).map(([categoryName, items]) => (
                    <div key={categoryName} className="mt-4">
                      <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                          <AccordionTrigger>{categoryName}</AccordionTrigger>
                          <AccordionContent>
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
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
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
                <div className="mt-4 font-bold">
                  Totale: €{total.toFixed(2)}
                </div>
                <button
                  onClick={handleCreateOrder}
                  className="bg-blue-500 text-white px-4 py-2 mt-2 w-full"
                >
                  Crea Ordine
                </button>
                {orderError && (
                  <p className="text-red-500 mt-2">{orderError}</p>
                )}
              </div>

              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Ordini Effettuati</SheetTitle>
                  <SheetDescription>
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
                                  <strong>Ordine #{order.id}</strong> -{" "}
                                  {order.customer_name}
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
                              <DialogTrigger
                                onClick={() => openEditModal(order)}
                              >
                                Modifica
                              </DialogTrigger>
                            </div>
                          ))
                      )}
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Modifica Ordine #{editingOrder?.id}
                          </DialogTitle>
                          <DialogDescription>
                            <input
                              type="text"
                              placeholder="Nome Cliente"
                              className="border p-2 w-full mb-2"
                              value={editingCustomer}
                              onChange={(e) =>
                                setEditingCustomer(e.target.value)
                              }
                            />
                            <h3 className="font-bold mb-2">
                              Seleziona Portate
                            </h3>
                            {menu.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-2 mb-1"
                              >
                                <label
                                  className={
                                    item.terminated ? "opacity-45" : ""
                                  }
                                >
                                  <input
                                    type="checkbox"
                                    checked={editingItems.some(
                                      (i) => i.id === item.id
                                    )}
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
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </div>
          </TabsContent>
        </Tabs>
      </Sheet>
    </div>
  );
}
