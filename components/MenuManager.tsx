"use client";

import { useState, useEffect } from "react";
import { updateMenuOrder, addMenuCategory } from "@/lib/supabase";
import {
  addMenuItem,
  toggleMenuItemStatus,
  deleteMenuItems,
} from "@/app/api/menu";
import { useToast } from "@/hooks/use-toast";
import { getCategories } from "@/lib/supabase";
import MenuCategories from "./MenuCategories";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface MenuItem {
  id: number;
  event_id: number;
  title: string;
  price: number;
  terminated: boolean;
  position: number;
  category_id?: number;
}

interface Category {
  id: number;
  name: string;
  position: number;
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
  const { toast } = useToast();

  // Funzione per caricare le categorie
  const fetchCategories = async () => {
    try {
      const categoryList = await getCategories(eventId);
      setCategories(categoryList);
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Errore nel recupero delle categorie.",
      });
    }
  };
  // Carica le categorie
  useEffect(() => {
    fetchCategories();
  }, [eventId]);

  async function handleAddMenuItem() {
    if (!newTitle.trim() || !newPrice || selectedCategory === "") {
      return toast({
        variant: "destructive",
        description: "Inserisci titolo, prezzo e categoria!",
      });
    }

    try {
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
      toast({ variant: "constructive", description: "Portata aggiunta." });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Errore nell'aggiunta della portata.",
      });
    }
  }

  async function handleAddCategory() {
    if (!newCategory.trim()) {
      return toast({
        variant: "destructive",
        description: "Inserisci un nome per la categoria!",
      });
    }

    try {
      await addMenuCategory(eventId, newCategory);
      setNewCategory(""); // Pulisce il campo categoria
      await fetchCategories(); // 🔄 Ricarica la lista delle categorie
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Errore nell'aggiunta della categoria",
      });
    }
  }

  async function handleDeleteItems() {
    if (selectedItems.length === 0)
      return toast({
        variant: "destructive",
        description: "Seleziona almeno una portata da eliminare!",
      });
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
      // Trova la categoria in base al suo id
      const category = categories.find((c) => c.id === item.category_id);

      // Se la categoria esiste e ha una posizione, usa quella posizione per il raggruppamento
      const categoryName = category ? category.name : "Senza categoria";

      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push(item);
      return acc;
    },
    {} as Record<string, MenuItem[]>
  );

  // Aggiungiamo l'ordinamento delle categorie, tenendo conto della posizione
  const sortedCategories = categories.sort((a, b) => a.position - b.position);

  // Raggruppa le portate in base all'ordine delle categorie
  const groupedMenuWithSortedCategories = sortedCategories.reduce(
    (acc, category) => {
      const categoryName = category.name;
      if (groupedMenu[categoryName]) {
        acc[categoryName] = groupedMenu[categoryName];
      }
      return acc;
    },
    {} as Record<string, MenuItem[]>
  );

  return (
    <div>
      <div className="mt-10">
        {/* Gestione Portate */}
        <h3 className="text-lg font-bold mb-5">Aggiungi Portata</h3>
        <div className="flex gap-x-4 justify-start">
          <Input
            type="text"
            placeholder="Titolo"
            value={newTitle}
            className="w-[250px]"
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Prezzo"
            value={newPrice}
            className="w-[200px]"
            onChange={(e) => setNewPrice(e.target.value)}
          />
          {/* <select
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(parseInt(e.target.value) || "")
            }
            className="border p-2 min-w-48"
          >
            <option value="">Categoria</option>
            {categories
              .sort((a, b) => a.position - b.position)
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select> */}
          <Select>
            <SelectTrigger
              className="w-[150px]"
              onChange={(e) =>
                setSelectedCategory(parseInt(e.target.value) || "")
              }
            >
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories
                .sort((a, b) => a.position - b.position)
                .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className=" mt-5">
          <Button variant={"default"} onClick={handleAddMenuItem} className=" ">
            Aggiungi Portata
          </Button>
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-lg font-bold">Gestisci Portate</h3>

        {Object.entries(groupedMenuWithSortedCategories).map(
          ([categoryName, items]) => (
            <div key={categoryName} className="mt-4">
              <h3 className="text-lg font-bold bg-foreground/10 p-2">
                {categoryName}
              </h3>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 border p-2"
                >
                  {/* <input
                    type="checkbox"
                    onChange={() =>
                      setSelectedItems((prev) =>
                        prev.includes(item.id)
                          ? prev.filter((id) => id !== item.id)
                          : [...prev, item.id]
                      )
                    }
                  /> */}
                  <div className="flex flex-1 items-center space-x-2">
                    <Checkbox
                      id={`item-${item.id}`}
                      onChange={() =>
                        setSelectedItems((prev) =>
                          prev.includes(item.id)
                            ? prev.filter((id) => id !== item.id)
                            : [...prev, item.id]
                        )
                      }
                    />
                    <label
                      htmlFor={`item-${item.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <span className="text-lg font-semibold">
                        {item.title}
                      </span>
                      <span className=""> - €{item.price} </span>
                      <span className="">
                        {item.terminated && "(Terminato)"}
                      </span>
                    </label>
                  </div>

                  <Button
                    size={null}
                    onClick={() =>
                      handleToggleTerminated(item.id, item.terminated)
                    }
                    className="text-sm px-2 py-1 bg-gray-500 text-white"
                  >
                    {item.terminated ? "Ripristina" : "Termina"}
                  </Button>
                </div>
              ))}
            </div>
          )
        )}
        <div className="flex justify-between gap-x-5 mt-5">
          <Button
            variant={"outline"}
            onClick={handleDeleteItems}
            className="px-4 py-2"
          >
            Elimina Selezionati
          </Button>
        </div>
      </div>

      {/* <div className=" mt-10">
        <h3 className="text-lg font-bold">Gestisci Categorie</h3>

        <div className="mb-4">
          <label className="block mb-1 font-semibold">Nuova categoria:</label>
          <Input
            type="text"
            placeholder="Nome categoria"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="border p-2 w-full mb-2"
          />
          <Button
            onClick={handleAddCategory}
            className="bg-blue-500 text-white px-4 py-2 "
          >
            Aggiungi Categoria
          </Button>
        </div>

        <MenuCategories categories={categories} setCategories={setCategories} />
      </div> */}
    </div>
  );
}
