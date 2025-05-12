"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useMenu } from "@/hooks/useMenu";
import { useOrders } from "@/hooks/useOrders";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";
import { createOrder, updateOrder } from "@/lib/supabase";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export default function OrdersPage() {
  const { id } = useParams();
  const eventId = Number(id);

  const { menu, isLoading: loadingMenu, error: errorMenu } = useMenu(eventId);
  const [customerName, setCustomerName] = useState("");

  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [orderError, setOrderError] = useState("");

  const { toast } = useToast();

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

  if (loadingMenu || loadingOrders) return <p>Caricamento...</p>;
  if (errorMenu)
    return <p>Errore nel caricamento del menu: {errorMenu.message}</p>;

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

  // Calcola il totale dell'ordine corrente
  const total = selectedItems.reduce((sum, item) => sum + item.price, 0);

  // Aggiunge una portata al carrello (può essere lo stesso item più volte)
  function handleAddToCart(item: any) {
    if (item.terminated) return; // non aggiungere se terminata
    setSelectedItems((prev) => [...prev, item]);
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
      toast({
        variant: "constructive",
        description: "Ordine creato con successo!",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        description: "Errore nella creazione dell'ordine!",
      });
      setOrderError("Errore nella creazione dell'ordine!");
      console.error(err);
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-2"> Portate Disponibili </h2>
      <div className="flex gap-5">
        <div className="flex-1">
          {menu.length === 0 ? (
            <p>Nessuna portata trovata.</p>
          ) : (
            Object.entries(groupedMenu).map(([categoryName, items]) => (
              <div key={categoryName} className="mt-4">
                <Accordion type="single" collapsible>
                  <AccordionItem value={categoryName}>
                    <AccordionTrigger>{categoryName}</AccordionTrigger>
                    <AccordionContent>
                      {items.map((item) => (
                        <Button
                          key={item.id}
                          size="lg"
                          variant={"secondary"}
                          onClick={() => handleAddToCart(item)}
                          disabled={item.terminated}
                          className={`block w-full text-left px-4 py-2 mb-2 ${
                            item.terminated
                              ? "bg-gray-500 cursor-not-allowed"
                              : "border hover:bg-foreground/5 "
                          }`}
                        >
                          {item.title} - €{item.price}
                        </Button>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ))
          )}
        </div>

        {/* Colonna 2: Carrello (portate selezionate) */}
        <div className="sticky top-5 h-full flex-1">
          <h2 className="text-xl font-bold mb-2">Carrello</h2>
          <Input
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
          <div className="my-4 font-bold">Totale: €{total.toFixed(2)}</div>
          <Button onClick={handleCreateOrder} className="w-full">
            Crea Ordine
          </Button>
          {orderError && <p className="text-red-500 mt-2">{orderError}</p>}
        </div>
      </div>
    </div>
  );
}
