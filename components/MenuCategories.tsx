import { useState } from "react";
import { deleteMenuCategories } from "@/lib/supabase";
import { toast } from "react-toastify";

interface MenuCategory {
  id: number;
  name: string;
  position: number;
}

interface Props {
  categories: MenuCategory[];
  setCategories: React.Dispatch<React.SetStateAction<MenuCategory[]>>;
  // handleCategoryOrderChange: (reorderedCategories: MenuCategory[]) => void;
}

export default function MenuCategories({
  categories,
  setCategories,
  // handleCategoryOrderChange,
}: Props) {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const handleDeleteCategories = async () => {
    if (selectedCategories.length === 0) {
      return toast.error("Seleziona almeno una categoria da eliminare!");
    }
    if (!confirm("Sei sicuro di voler eliminare le categorie selezionate?")) {
      return;
    }
    try {
      await deleteMenuCategories(selectedCategories);
      toast.success("Categorie eliminate con successo!");
      setSelectedCategories([]); // Resetta la selezione
      setCategories((prev) =>
        prev.filter((category) => !selectedCategories.includes(category.id))
      );
    } catch (error) {
      toast.error("Errore nell'eliminazione delle categorie.");
    }
  };

  const toggleCategorySelection = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div>
      <label className="block mb-1 font-semibold">Categorie:</label>

      <div className="">
        {categories.map((category, index) => (
          <div key={category.id} className="flex items-center gap-2 border p-2">
            <input
              type="checkbox"
              checked={selectedCategories.includes(category.id)}
              onChange={() => toggleCategorySelection(category.id)}
            />
            <span>{category.name}</span>
          </div>
        ))}
      </div>
      <button
        onClick={handleDeleteCategories}
        className="bg-red-500 text-white px-4 py-2 mt-4"
      >
        Elimina Selezionati
      </button>
    </div>
  );
}
