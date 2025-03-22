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
    <div className="p-4 border rounded-md bg-white shadow">
      <h2 className="text-xl font-bold mb-2">Ordini Effettuati</h2>
      {orders.length === 0 ? (
        <p>Nessun ordine effettuato.</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex justify-between items-center p-2 border-b"
            >
              <div>
                <p>
                  <strong>#{order.id}</strong> - {order.customer_name}
                </p>
                <p className="text-gray-500">
                  Totale: €{order.total.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(order.id)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                disabled={loadingOrder === order.id}
              >
                {loadingOrder === order.id ? "Eliminando..." : "❌"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
