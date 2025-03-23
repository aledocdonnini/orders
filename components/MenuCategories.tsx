import { useEffect, useState } from "react";
import {
  getCategories,
  deleteMenuCategories,
  updateCategoryOrder,
} from "@/lib/supabase"; // Funzione per eliminare categorie
import { toast } from "react-toastify";
import { useDrag, useDrop } from "react-dnd";
import { DndProvider, useDragDropManager } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface MenuCategory {
  id: number;
  name: string;
}

interface Props {
  eventId: number;
}

interface DragItem {
  index: number;
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

  // Funzione per aggiornare l'ordine delle categorie nel database e nel frontend
  const handleMoveCategory = async (dragIndex: number, hoverIndex: number) => {
    const reorderedCategories = [...categories];
    const draggedCategory = reorderedCategories[dragIndex];
    reorderedCategories.splice(dragIndex, 1);
    reorderedCategories.splice(hoverIndex, 0, draggedCategory);

    // Aggiorna l'ordine localmente nel frontend
    setCategories(reorderedCategories);

    // Aggiungi la logica per aggiornare l'ordine nel database
    try {
      await updateCategoryOrder(reorderedCategories); // Chiamata al backend
      toast.success("Ordine delle categorie aggiornato con successo.");
    } catch (error) {
      toast.error("Errore nel riorganizzare le categorie.");
    }
  };

  const CategoryItem = ({
    category,
    index,
  }: {
    category: MenuCategory;
    index: number;
  }) => {
    const [{ isDragging }, drag] = useDrag({
      type: "CATEGORY",
      item: { index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [, drop] = useDrop({
      accept: "CATEGORY",
      hover: (draggedItem: DragItem) => {
        if (draggedItem.index !== index) {
          handleMoveCategory(draggedItem.index, index);
          draggedItem.index = index;
        }
      },
    });

    return (
      <div
        ref={(node) => {
          if (node) drag(drop(node));
        }}
        className={`flex items-center gap-2 border p-2 ${
          isDragging ? "opacity-50" : ""
        }`}
      >
        <input
          type="checkbox"
          checked={selectedCategories.includes(category.id)}
          onChange={() => toggleCategorySelection(category.id)}
        />
        <span>{category.name}</span>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h2 className="text-lg font-bold">Gestisci Categorie</h2>
        <div>
          {categories.length === 0 ? (
            <p>Nessuna categoria trovata.</p>
          ) : (
            categories.map((category, index) => (
              <CategoryItem
                key={category.id}
                category={category}
                index={index}
              />
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
    </DndProvider>
  );
}
