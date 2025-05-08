"use client";
import { deleteOrder } from "@/lib/supabase";
import { useOrders } from "@/hooks/useOrders";
import { useState } from "react";

export default function OrderList({ eventId }: { eventId: number }) {
  const { orders, isLoading, error, mutate } = useOrders(eventId);
  const [loadingOrder, setLoadingOrder] = useState<number | null>(null);

  if (isLoading) return <p>Caricamento ordini...</p>;
  if (error) return <p>Errore nel caricamento ordini.</p>;

  const handleDelete = async (orderId: number) => {
    setLoadingOrder(orderId);
    try {
      await deleteOrder(orderId);
      mutate(); // Aggiorna la lista degli ordini
    } catch (err) {
      console.error("Errore nella cancellazione:", err);
    }
    setLoadingOrder(null);
  };

  return (
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
  );
}
