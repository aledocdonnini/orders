"use client";

import { useEffect, useState } from "react";
import { useOrderContext } from "@/context/OrderContext";
import MenuManager from "@/components/MenuManager";
import OrderManagementView from "@/components/OrderManagementView";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function EventPage({ params }: { params: { id: string } }) {
  const { selectedEvent, setSelectedEvent, fetchMenu } = useOrderContext();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"menu" | "ordini">("menu");
  const router = useRouter();

  // Imposta mounted a true sul client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchEventAndMenu() {
      if (!selectedEvent) {
        setLoading(true);
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", params.id)
          .single();
        if (error) {
          console.error("Errore nel fetch dell'evento:", error);
        } else if (data) {
          setSelectedEvent(data);
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
    if (mounted) {
      fetchEventAndMenu();
    }
  }, [mounted, params.id, selectedEvent, setSelectedEvent]);

  useEffect(() => {
    if (mounted && selectedEvent) {
      fetchMenu();
    }
  }, [mounted, selectedEvent, fetchMenu]);

  if (!mounted || loading) {
    return <p>Caricamento...</p>;
  }
  if (!selectedEvent || selectedEvent.id.toString() !== params.id) {
    return <p>Evento non trovato</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Evento: {selectedEvent.title}</h1>
      {/* Tab switch */}
      <div className="mt-4 flex gap-4">
        <button
          className={`px-4 py-2 border ${
            activeTab === "menu" ? "bg-blue-500 text-white" : ""
          }`}
          onClick={() => setActiveTab("menu")}
        >
          Gestione Menu
        </button>
        <button
          className={`px-4 py-2 border ${
            activeTab === "ordini" ? "bg-blue-500 text-white" : ""
          }`}
          onClick={() => setActiveTab("ordini")}
        >
          Gestione Ordini
        </button>
      </div>
      {/* Contenuto della tab */}
      <div className="mt-4">
        {activeTab === "menu" ? <MenuManager /> : <OrderManagementView />}
      </div>
    </div>
  );
}
