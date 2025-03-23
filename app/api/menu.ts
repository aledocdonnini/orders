"use server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getMenu(eventId: number) {
  const { data, error } = await supabase
    .from("menu")
    .select("*")
    .eq("event_id", eventId);
  if (error) throw error;
  return data;
}

export async function addMenuItem(
  eventId: number,
  title: string,
  price: number,
  categoryId: number | ""
) {
  const { data, error } = await supabase
    .from("menu")
    .insert([{ event_id: eventId, title, price, category_id: categoryId }]);

  if (error) {
    throw error;
  }
  return data;
}

export async function deleteMenuItems(ids: number[]) {
  const { error } = await supabase.from("menu").delete().in("id", ids);
  if (error) throw error;
}

export async function toggleMenuItemStatus(
  itemId: number,
  terminated: boolean
) {
  const { error } = await supabase
    .from("menu")
    .update({ terminated })
    .eq("id", itemId);
  if (error) throw error;
}

// Funzione per aggiornare la categoria della portata
export async function updateMenuItemCategory(
  menuItemId: number,
  categoryId: number
) {
  try {
    const { data, error } = await supabase
      .from("menu")
      .update({ category_id: categoryId }) // Assicurati che la colonna 'category' nel DB sia di tipo intero, se stai passando un ID
      .eq("id", menuItemId) // Assicurati che l'id della portata sia corretto
      .select(); // Selezioniamo la riga aggiornata, per eventuali controlli

    if (error) throw error;

    console.log("Categoria aggiornata con successo:", data);
    return data;
  } catch (error) {
    console.error("Errore durante l'aggiornamento della categoria:", error);
    throw new Error("Impossibile aggiornare la categoria della portata.");
  }
}
