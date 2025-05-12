"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
interface EventCreatorProps {
  onEventCreated: (title: string, date: string) => void;
}

export default function EventCreator({ onEventCreated }: EventCreatorProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title || !date) return;

    setLoading(true);
    setError(null);

    try {
      const isoDate = date.toISOString().split("T")[0]; // "YYYY-MM-DD"
      await onEventCreated(title, isoDate);
      setTitle("");
      setDate(undefined);
    } catch (err: any) {
      console.error("Errore nella creazione dell'evento:", err);
      setError("Errore nella creazione dell'evento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" text-center">
      <h2 className="text-xl font-bold mb-5">Crea un nuovo evento</h2>

      <Input
        className="border p-2 w-full mt-2"
        placeholder="Titolo evento"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="mt-4">
        <Popover modal={true}>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-between text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              {date ? format(date, "PPP") : <span>Seleziona data</span>}
              <CalendarIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button
        className="mx-auto px-4 py-2 mt-5 disabled:opacity-50"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Creazione in corso..." : "Aggiungi Evento"}
      </Button>

      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
