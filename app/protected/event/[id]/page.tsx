"use client";

import { useEvent } from "@/hooks/useEvent";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function EventPage() {
  const { id } = useParams();
  const eventId = Number(id);
  const {
    event,
    isLoading: loadingEvent,
    error: errorEvent,
  } = useEvent(eventId);
  const router = useRouter();

  useEffect(() => {
    router.push(`/protected/event/${eventId}/menu`);
  }, [id]);

  return (
    <div>
      <div className="mb-5 ">
        {loadingEvent ? (
          <span className="text-sm font-normal">Caricamento evento...</span>
        ) : errorEvent ? (
          <span className="text-sm font-normal text-red-500">
            Errore nel caricamento evento
          </span>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
