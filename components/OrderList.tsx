"use client";

import { useOrderContext } from "@/context/OrderContext";

// Definizione del tipo per un ordine
interface Order {
  id: number;
  event_id: number;
  items: { title: string; price: number }[];
  total: number;
}

export default function OrderList() {
  const { orders } = useOrderContext();

  return (
    <div className="p-4 border rounded mt-4">
      <h2 className="text-xl font-bold">Ordini Completati</h2>
      <ul className="space-y-2">
        {orders.map((order: Order) => (
          <li key={order.id} className="border p-2">
            <span>
              Ordine #{order.id} - Totale: €{order.total.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
