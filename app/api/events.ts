// "use server";
// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

// // Ottiene tutti gli eventi
// export async function getEvents() {
//   const { data, error } = await supabase.from("events").select("*");
//   if (error) throw error;
//   return data;
// }

// // Crea un nuovo evento
// export async function createEvent(title: string, date: string) {
//   const { data, error } = await supabase
//     .from("events")
//     .insert([{ title, date }])
//     .select("*");
//   if (error) throw error;
//   return data[0];
// }
