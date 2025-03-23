import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { deleteMenuCategories, updateCategoryOrder } from "@/lib/supabase";
import { toast } from "react-toastify";
import { useDrag, useDrop } from "react-dnd";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface MenuCategory {
  id: number;
  name: string;
  position: number;
}

interface Props {
  categories: MenuCategory[];
  handleCategoryOrderChange: (reorderedCategories: MenuCategory[]) => void;
}

interface DragItem {
  index: number;
}

export default function MenuCategories({
  categories,
  handleCategoryOrderChange,
}: Props) {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const toggleCategorySelection = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

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
    } catch (error) {
      toast.error("Errore nell'eliminazione delle categorie.");
    }
  };

  const handleMoveCategory = async (dragIndex: number, hoverIndex: number) => {
    const reorderedCategories = [...categories];
    const draggedCategory = reorderedCategories[dragIndex];
    reorderedCategories.splice(dragIndex, 1);
    reorderedCategories.splice(hoverIndex, 0, draggedCategory);

    handleCategoryOrderChange(reorderedCategories);

    try {
      await updateCategoryOrder(reorderedCategories);
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
