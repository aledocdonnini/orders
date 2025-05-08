"use client";
import { useParams } from "next/navigation";
import { useMenu } from "@/hooks/useMenu";
import { useOrders } from "@/hooks/useOrders";

import MenuManager from "@/components/MenuManager";

export default function OrdersPage() {
  const { id } = useParams();
  const eventId = Number(id);

  const { menu, isLoading: loadingMenu, error: errorMenu } = useMenu(eventId);

  const {
    orders,
    isLoading: loadingOrders,
    error: errorOrders,
    mutate: mutateOrders,
  } = useOrders(eventId);

  if (loadingMenu || loadingOrders) return <p>Caricamento...</p>;
  if (errorMenu)
    return <p>Errore nel caricamento del menu: {errorMenu.message}</p>;
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-2">Gestione Menu {eventId}</h2>

      <MenuManager eventId={eventId} menu={menu} mutate={mutateOrders} />
    </div>
  );
}
