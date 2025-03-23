import { useEffect, useState } from "react";
import { getCategories, deleteMenuCategories } from "@/lib/supabase"; // Funzione per eliminare categorie
import { toast } from "react-toastify";

interface MenuCategory {
  id: number;
  name: string;
}

interface Props {
  eventId: number;
}

export default function MenuCategories({ eventId }: Props) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // Funzione per recuperare le categorie dal database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getCategories(eventId);
        setCategories(categories);
        console.log("Categorie recuperate:", categories);
      } catch (error) {
        console.error("Errore nel recupero delle categorie:", error);
      }
    };

    fetchCategories();
  }, [eventId]);

  // Funzione per gestire la selezione/deselezione delle categorie
  const toggleCategorySelection = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Funzione per eliminare le categorie selezionate
  const handleDeleteCategories = async () => {
    if (selectedCategories.length === 0) {
      return toast.error("Seleziona almeno una categoria da eliminare!");
    }
    if (!confirm("Sei sicuro di voler eliminare le categorie selezionate?")) {
      return;
    }
    try {
      await deleteMenuCategories(selectedCategories);
      setCategories((prev) =>
        prev.filter((category) => !selectedCategories.includes(category.id))
      );
      setSelectedCategories([]);
      toast.success("Categorie eliminate con successo!");
    } catch (error) {
      toast.error("Errore nell'eliminazione delle categorie.");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold">Gestisci Categorie</h2>
      <div>
        {categories.length === 0 ? (
          <p>Nessuna categoria trovata.</p>
        ) : (
          categories
            .sort((a, b) => a.id - b.id)
            .map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-2 border p-2"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => toggleCategorySelection(category.id)}
                />
                <span>{category.name}</span>
              </div>
            ))
        )}
        <button
          onClick={handleDeleteCategories}
          className="bg-red-500 text-white px-4 py-2 mt-4"
        >
          Elimina Selezionati
        </button>
      </div>
    </div>
  );
}
