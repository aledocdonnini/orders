"use client";
import OrderList from "@/components/OrderList";

export default function OrdersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Lista Ordini</h1>
      <OrderList eventId={1} />
    </div>
  );
}
