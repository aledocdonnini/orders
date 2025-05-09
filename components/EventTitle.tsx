"use client";
import { useEvent } from "@/hooks/useEvent";
import { useParams } from "next/navigation";
import { formatDate } from "@/lib/utils";

export default function EventTitle() {
  const { id } = useParams();
  const eventId = Number(id);
  const { event } = useEvent(eventId);

  const formattedDate = formatDate(event?.date);
  if (!id) {
    return;
  }
  return (
    <div>
      <h1 className="font-bold text-5xl">{event?.title || "..."}</h1>
      <div className="font-normal text-base mt-2 pb-5 mb-5 border-b ">
        {formattedDate || "..."}
      </div>
    </div>
  );
}
