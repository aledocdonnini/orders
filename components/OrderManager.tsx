"use client";

import { useOrderContext } from "@/context/OrderContext";

export default function OrderManager() {
  const { menu, addToOrder, completeOrder, currentOrder } = useOrderContext();

  return (
    <div className="p-4 border rounded mt-4">
      <h2 className="text-xl font-bold">Crea un Ordine</h2>
      <div className="flex flex-wrap gap-2">
        {menu.map((item) => (
          <div
            key={item.id}
            className="border p-2 cursor-pointer hover:bg-gray-200"
            onClick={() => addToOrder(item)}
          >
            {item.title} - €{item.price.toFixed(2)}
          </div>
        ))}
      </div>
      <div className="mt-4">
        <h3 className="font-bold">Carrello</h3>
        {currentOrder.length > 0 ? (
          <>
            <ul>
              {currentOrder.map((item, index) => (
                <li key={index}>
                  {item.title} - €{item.price.toFixed(2)}
                </li>
              ))}
            </ul>
            <button
              className="bg-red-500 text-white px-4 py-2 mt-2"
              onClick={completeOrder}
            >
              Completa Ordine
            </button>
          </>
        ) : (
          <p>
            Carrello vuoto. Aggiungi delle portate per iniziare un nuovo ordine.
          </p>
        )}
      </div>
    </div>
  );
}
