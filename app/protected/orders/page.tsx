"use client";

import { useOrderContext } from "@/context/OrderContext";
import OrderList from "@/components/OrderList";

export default function OrdersPage() {
  const { orders } = useOrderContext();

  return (
    <div>
      <h1 className="text-2xl font-bold">Lista Ordini</h1>
      <OrderList />
    </div>
  );
}
