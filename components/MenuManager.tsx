import { useState } from "react";
import { updateMenuItem } from "@/lib/supabase";
import { toast } from "react-toastify";

function MenuItem({
  item,
  onEdit,
}: {
  item: any;
  onEdit: (id: number, title: string, price: number) => void;
}) {
  return (
    <div className="flex justify-between items-center p-2 border-b">
      <span>
        {item.title} - €{item.price}
      </span>
      <button
        onClick={() => onEdit(item.id, item.title, item.price)}
        className="text-blue-500 ml-2"
      >
        ✏️
      </button>
    </div>
  );
}

export default function MenuManager({
  menu,
  setMenu,
}: {
  menu: any[];
  setMenu: (menu: any[]) => void;
}) {
  const [editingItem, setEditingItem] = useState<{
    id: number;
    title: string;
    price: number;
  } | null>(null);

  async function handleUpdateMenuItem(
    id: number,
    title: string,
    price: number
  ) {
    try {
      const updatedItem = await updateMenuItem(id, title, price);
      setMenu(menu.map((item) => (item.id === id ? updatedItem : item)));
      setEditingItem(null);
      toast.success("Portata aggiornata!");
    } catch (error) {
      toast.error("Errore nella modifica della portata.");
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold">Menu</h2>
      {menu.map((item) => (
        <MenuItem
          key={item.id}
          item={item}
          onEdit={(id, title, price) => setEditingItem({ id, title, price })}
        />
      ))}

      {editingItem && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded">
            <h3 className="text-lg font-bold">Modifica portata</h3>
            <input
              className="border p-2 w-full mb-2"
              value={editingItem.title}
              onChange={(e) =>
                setEditingItem({ ...editingItem, title: e.target.value })
              }
            />
            <input
              className="border p-2 w-full mb-2"
              type="number"
              value={editingItem.price}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  price: Number(e.target.value),
                })
              }
            />
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setEditingItem(null)}
              >
                Annulla
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() =>
                  handleUpdateMenuItem(
                    editingItem.id,
                    editingItem.title,
                    editingItem.price
                  )
                }
              >
                Salva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
