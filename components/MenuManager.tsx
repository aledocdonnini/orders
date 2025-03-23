"use client";

import { useState, useEffect, useCallback } from "react";
import { updateMenuOrder, addMenuCategory } from "@/lib/supabase";
import {
  addMenuItem,
  toggleMenuItemStatus,
  deleteMenuItems,
} from "@/app/api/menu";
import { toast } from "react-toastify";
import { getCategories } from "@/lib/supabase"; // Importa la funzione getCategories
import MenuCategories from "./MenuCategories";

interface MenuItem {
  id: number;
  event_id: number;
  title: string;
  price: number;
  terminated: boolean;
  position: number;
  category_id?: number; // Utilizziamo category_id per il riferimento alla categoria
}

interface Category {
  id: number;
  name: string;
}

interface Props {
  eventId: number;
  menu: MenuItem[];
  mutate: () => void;
}

export default function MenuManager({ eventId, menu, mutate }: Props) {
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");
  const [menuState, setMenuState] = useState<MenuItem[]>(menu);

  // Carica le categorie
  useEffect(() => {
    async function fetchCategories() {
      try {
        const categoryList = await getCategories(eventId);
        setCategories(categoryList);
      } catch (error) {
        toast.error("Errore nel recupero delle categorie.");
      }
    }
    fetchCategories();
  }, [eventId]);

  async function handleAddMenuItem() {
    if (!newTitle.trim() || !newPrice || selectedCategory === "") {
      return toast.error("Inserisci titolo, prezzo e categoria!");
    }

    try {
      // Passiamo anche la categoria nella funzione addMenuItem
      await addMenuItem(
        eventId,
        newTitle,
        parseFloat(newPrice),
        selectedCategory
      );
      setNewTitle("");
      setNewPrice("");
      setSelectedCategory(""); // Resetta la categoria selezionata
      mutate();
    } catch (error) {
      toast.error("Errore nell'aggiunta della portata.");
    }
  }

  // Gestione dell'aggiunta della categoria
  async function handleAddCategory() {
    if (!newCategory.trim()) {
      return toast.error("Inserisci un nome per la categoria!");
    }

    try {
      await addMenuCategory(eventId, newCategory);
      setNewCategory(""); // Pulisce il campo categoria
      mutate(); // Ricarica i dati
    } catch (error) {
      toast.error("Errore nell'aggiunta della categoria");
    }
  }

  async function handleDeleteItems() {
    if (selectedItems.length === 0)
      return toast.error("Seleziona almeno una portata da eliminare!");
    if (!confirm("Sei sicuro di voler eliminare le portate selezionate?"))
      return;
    await deleteMenuItems(selectedItems);
    setSelectedItems([]);
    mutate();
  }

  async function handleToggleTerminated(itemId: number, terminated: boolean) {
    await toggleMenuItemStatus(itemId, !terminated);
    mutate();
  }

  const groupedMenu = menuState.reduce(
    (acc, item) => {
      const category =
        categories.find((c) => c.id === item.category_id)?.name ||
        "Senza categoria";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, MenuItem[]>
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Gestione Portate */}
      <div>
        <h2 className="text-lg font-bold">Aggiungi Portata</h2>
        <input
          type="text"
          placeholder="Titolo"
          className="border p-2 mr-2"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <input
          type="number"
          placeholder="Prezzo"
          className="border p-2 mr-2"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(parseInt(e.target.value) || "")}
          className="border p-2"
        >
          <option value="">Seleziona una categoria</option>
          {categories
            .sort((a, b) => a.id - b.id)
            .map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
        </select>

        <button
          onClick={handleAddMenuItem}
          className="bg-blue-500 text-white px-4 py-2"
        >
          Aggiungi
        </button>

        <h2 className="text-lg font-bold mt-6">Gestisci Portate</h2>

        {Object.entries(groupedMenu).map(([categoryName, items]) => (
          <div key={categoryName} className="mt-4">
            <h3 className="text-lg font-bold bg-gray-100 p-2">
              {categoryName}
            </h3>
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 border p-2">
                <input
                  type="checkbox"
                  onChange={() =>
                    setSelectedItems((prev) =>
                      prev.includes(item.id)
                        ? prev.filter((id) => id !== item.id)
                        : [...prev, item.id]
                    )
                  }
                />
                <div className="flex-1">
                  {item.title} - €{item.price}{" "}
                  {item.terminated && "(Terminato)"}
                </div>
                <button
                  onClick={() =>
                    handleToggleTerminated(item.id, item.terminated)
                  }
                  className="text-sm px-2 py-1 bg-gray-500 text-white"
                >
                  {item.terminated ? "Ripristina" : "Termina"}
                </button>
              </div>
            ))}
          </div>
        ))}

        <button
          onClick={handleDeleteItems}
          className="bg-red-500 text-white px-4 py-2 mt-4"
        >
          Elimina Selezionati
        </button>
      </div>

      {/* Gestione Categorie */}
      <div>
        <h2 className="text-lg font-bold">Aggiungi Categoria</h2>
        <input
          type="text"
          placeholder="Nome categoria"
          className="border p-2 mr-2"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button
          onClick={handleAddCategory}
          className="bg-green-500 text-white px-4 py-2"
        >
          Aggiungi
        </button>

        <MenuCategories eventId={eventId} />
      </div>
    </div>
  );
}
