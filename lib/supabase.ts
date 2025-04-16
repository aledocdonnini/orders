import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
interface MenuItem {
  id: number;
  event_id: number;
  title: string;
  price: number;
  terminated: boolean;
  position: number;
  category?: string;
}
interface OrderItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
}
interface MenuCategory {
  id: number;
  name: string;
  position: number;
}

interface CategoryOrder {
  id: number;
  position: number;
  event_id: number;
}

// Ottiene tutti gli eventi
export async function getEvents() {
  const { data, error } = await supabase.from("events").select("*");
  if (error) throw error;
  return data;
}

// Crea un nuovo evento
export async function createEvent(title: string, date: string) {
  const { data, error } = await supabase
    .from("events")
    .insert([{ title, date }])
    .select("*");
  if (error) throw error;
  return data[0];
}

// Elimina un evento
export async function deleteEvent(id: number) {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}

// Funzione per aggiornare una portata
export async function updateMenuItem(
  id: number,
  title: string,
  price: number
): Promise<MenuItem> {
  const { data, error } = await supabase
    .from("menu")
    .update({ title, price })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as MenuItem; // Assicurati di restituire i dati come un MenuItem
}

export async function createOrder(
  eventId: number,
  customerName: string,
  items: OrderItem[]
) {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  const { data, error } = await supabase
    .from("orders")
    .insert([{ event_id: eventId, customer_name: customerName, items, total }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteOrder(orderId: number) {
  const { error } = await supabase.from("orders").delete().eq("id", orderId);

  if (error) throw new Error(error.message);
}

export async function updateOrder(
  orderId: number,
  customerName: string,
  items: any[]
) {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const { data, error } = await supabase
    .from("orders")
    .update({ customer_name: customerName, items, total })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateMenuOrder(updatedCategories: CategoryOrder[]) {
  const updates = updatedCategories.map((category) => ({
    id: category.id,
    position: category.position,
    event_id: category.event_id, // Assicurati che event_id venga passato
  }));

  try {
    const { error } = await supabase
      .from("menu_categories") // Supponendo che la tabella per le categorie sia "menu_categories"
      .upsert(updates, { onConflict: "id" });

    if (error) throw error;
    console.log("Ordine delle categorie aggiornato con successo!");
  } catch (error) {
    console.error(
      "Errore nell'aggiornamento dell'ordine delle categorie:",
      error
    );
    throw error;
  }
}

// Funzione per verificare se l'evento esiste
async function checkEventExists(eventId: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventId)
      .single();

    if (error) {
      console.error("Errore nel recupero dell'evento:", error);
      return false; // Se c'è un errore nella query, assume che l'evento non esista
    }

    return data !== null; // Se viene trovato un evento, restituisce true
  } catch (error) {
    console.error("Errore nel controllo dell'esistenza dell'evento:", error);
    return false;
  }
}

export const fetchMenuCategories = async () => {
  try {
    const { data, error } = await supabase
      .from("menu_categories")
      .select("*")
      .order("position", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Errore nel recupero delle categorie:", error);
    return [];
  }
};

export async function getMenuCategories() {
  const { data, error } = await supabase
    .from("menu_categories")
    .select("*")
    .order("position");
  if (error) throw error;
  return data;
}

// Funzione per aggiungere una categoria
export async function addMenuCategory(
  eventId: number,
  categoryName: string
): Promise<void> {
  // Verifica che l'evento esista
  const eventExists = await checkEventExists(eventId);

  if (!eventExists) {
    throw new Error("L'evento con l'ID specificato non esiste.");
  }

  try {
    const { error } = await supabase
      .from("menu_categories")
      .insert([{ event_id: eventId, name: categoryName }]);

    if (error) throw error;
  } catch (error: unknown) {
    // Log dell'errore per analizzare la struttura
    console.error("Errore nel blocco catch:", error);

    if (error instanceof Error) {
      // Se l'errore è un'istanza di Error, possiamo accedere alle sue proprietà
      console.error("Errore nell'aggiunta della categoria:", error.message);
      throw new Error("Impossibile aggiungere la categoria.");
    } else if (error && typeof error === "object" && "message" in error) {
      // Se l'errore è un oggetto e contiene una proprietà 'message', lo trattiamo come errore
      const e = error as { message: string };
      console.error("Errore nell'aggiunta della categoria:", e.message);
      throw new Error("Impossibile aggiungere la categoria.");
    } else {
      // Gestione di errori sconosciuti
      console.error("Errore sconosciuto nell'aggiunta della categoria:", error);
      throw new Error(
        "Impossibile aggiungere la categoria per un errore sconosciuto."
      );
    }
  }
}

// Funzione per ottenere le categorie dal database
export async function getCategories(eventId: number): Promise<
  {
    position: number;
    id: number;
    name: string;
  }[]
> {
  console.log("Fetching categories for eventId:", eventId); // Aggiungi il log qui
  try {
    const { data, error } = await supabase
      .from("menu_categories")
      .select("id, name, position") // Aggiungi 'position' alla query
      .eq("event_id", eventId);

    if (error) {
      console.error("Errore nel recupero delle categorie:", error);
      throw error;
    }

    return data || []; // Assicurati che ritorni un array vuoto se non ci sono dati
  } catch (error) {
    console.error("Errore nel recupero delle categorie:", error);
    throw new Error("Impossibile recuperare le categorie.");
  }
}

// Funzione per eliminare le categorie selezionate
export async function deleteMenuCategories(
  categoryIds: number[]
): Promise<void> {
  try {
    const { error } = await supabase
      .from("menu_categories")
      .delete()
      .in("id", categoryIds);

    if (error) throw error;
  } catch (error) {
    console.error("Errore nell'eliminazione delle categorie:", error);
    throw new Error("Impossibile eliminare le categorie.");
  }
}

// Funzione per aggiornare l'ordine delle categorie nel database
export const updateCategoryOrder = async (categories: MenuCategory[]) => {
  try {
    const updatePromises = categories.map((category) =>
      supabase
        .from("menu_categories")
        .update({ position: category.position }) // Usa la posizione aggiornata
        .eq("id", category.id)
    );

    const results = await Promise.all(updatePromises);

    // Verifica se ci sono errori in uno qualsiasi degli aggiornamenti
    const hasErrors = results.some((result) => result.error);

    if (hasErrors) {
      results.forEach((result, index) => {
        if (result.error) {
          console.error(
            `Errore nell'aggiornamento della categoria ${categories[index].id}:`,
            result.error
          );
        }
      });
      throw new Error("Errore nell'aggiornamento di una o più categorie.");
    }

    console.log("Aggiornamento riuscito per tutte le categorie:", results);
    return results;
  } catch (error) {
    console.error("Errore globale nell'aggiornamento delle categorie:", error);
    throw error;
  }
};
