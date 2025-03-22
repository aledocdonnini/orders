"use client";

import { useState } from "react";
import { useOrderContext } from "@/context/OrderContext";

export default function OrderManagementView() {
  const { menu, addToOrder, currentOrder, completeOrder, orders } =
    useOrderContext();
  const [customerName, setCustomerName] = useState("");

  const total = currentOrder.reduce((acc, item) => acc + item.price, 0);

  const handleCompleteOrder = () => {
    if (!customerName || currentOrder.length === 0) return;
    completeOrder(customerName);
    setCustomerName("");
  };

  return (
    <div className="flex gap-4">
      {/* Colonna 1: Portate Disponibili */}
      <div className="flex-1 border p-4">
        <h3 className="font-bold mb-2">Portate Disponibili</h3>
        {menu.length === 0 ? (
          <p>Nessuna portata disponibile</p>
        ) : (
          <ul className="space-y-2">
            {menu.map((item) => (
              <li
                key={item.id}
                className="border p-2 cursor-pointer hover:bg-gray-200"
                onClick={() => addToOrder(item)}
              >
                {item.title} - €{item.price.toFixed(2)}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Colonna 2: Ordine in Corso */}
      <div className="flex-1 border p-4">
        <h3 className="font-bold mb-2">Ordine in Corso</h3>
        <input
          type="text"
          placeholder="Nome cliente"
          className="border p-2 w-full mb-2"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        {currentOrder.length === 0 ? (
          <p>Nessuna portata aggiunta</p>
        ) : (
          <ul className="space-y-2 mb-2">
            {currentOrder.map((item, index) => (
              <li key={index}>
                {item.title} - €{item.price.toFixed(2)}
              </li>
            ))}
          </ul>
        )}
        <p className="font-bold">Totale: €{total.toFixed(2)}</p>
        <button
          className="bg-red-500 text-white px-4 py-2 mt-2"
          onClick={handleCompleteOrder}
        >
          Completa Ordine
        </button>
      </div>
      {/* Colonna 3: Ordini Completati */}
      <div className="flex-1 border p-4">
        <h3 className="font-bold mb-2">Ordini Completati</h3>
        {orders.length === 0 ? (
          <p>Nessun ordine effettuato</p>
        ) : (
          <ul className="space-y-2">
            {orders.map((order) => (
              <li key={order.id} className="border p-2">
                <p>Ordine #{order.id}</p>
                <p>Cliente: {order.customer}</p>
                <p>Totale: €{order.total.toFixed(2)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
