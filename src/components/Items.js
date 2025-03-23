import React, { useState, useEffect, useContext } from "react";
import { LanguageContext } from "./LanguageContext";
import { db, auth } from "../firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const translations = {
  en: {
    title: "Items Management",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    newItemNamePlaceholder: "New Item Name",
    pricePlaceholder: "Price (in IQD)",
  },
  ar: {
    title: "إدارة العناصر",
    edit: "تعديل",
    delete: "حذف",
    save: "حفظ",
    newItemNamePlaceholder: "اسم العنصر الجديد",
    pricePlaceholder: "السعر (بالدينار العراقي)",
  },
  ku: {
    title: "بەڕێوەبردنی کاڵاکان",
    edit: "دەستکاری",
    delete: "سڕینەوە",
    save: "پاشەکەوت",
    newItemNamePlaceholder: "ناوی کاڵای نوێ",
    pricePlaceholder: "نرخ (بە دینار عێراقی)",
  },
};

const Items = ({ currency, exchangeRate }) => {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "items"),
      (snapshot) => {
        const itemsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(itemsData);
      },
      (error) => {
        console.error("Error fetching items:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleEdit = (item) => {
    setEditingItem(item);
    setNewItemName(item.name);
    setNewItemPrice(item.price);
  };

  const handleSave = async () => {
    if (auth.currentUser.uid !== "qBnUF4aOaYPxHP2VlDdQOq2sEKl2") {
      alert("Only admin can modify items.");
      return;
    }

    if (editingItem) {
      const itemRef = doc(db, "items", editingItem.id);
      await updateDoc(itemRef, {
        name: newItemName,
        price: parseFloat(newItemPrice),
      });
      setEditingItem(null);
    } else {
      const price = parseFloat(newItemPrice);
      if (newItemName && !isNaN(price)) {
        await addDoc(collection(db, "items"), {
          name: newItemName,
          price,
        });
      }
    }
    setNewItemName("");
    setNewItemPrice("");
  };

  const handleDelete = async (itemId) => {
    if (auth.currentUser.uid !== "qBnUF4aOaYPxHP2VlDdQOq2sEKl2") {
      alert("Only admin can delete items.");
      return;
    }
    await deleteDoc(doc(db, "items", itemId));
  };

  const priceDisplay = (price) =>
    currency === "USD" ? (price / exchangeRate).toFixed(2) : price;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{translations[language].title}</h2>
      <ul className="mb-4">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between items-center mb-2">
            {editingItem && editingItem.id === item.id ? (
              <>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="mr-2 border p-1"
                />
                <input
                  type="number"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="mr-2 border p-1"
                />
              </>
            ) : (
              <>
                <span>
                  {item.name} - {priceDisplay(item.price)} {currency}
                </span>
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                >
                  {translations[language].edit}
                </button>
              </>
            )}
            <button
              onClick={() => handleDelete(item.id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              {translations[language].delete}
            </button>
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={newItemName}
        onChange={(e) => setNewItemName(e.target.value)}
        placeholder={translations[language].newItemNamePlaceholder}
        className="mr-2 border p-1"
      />
      <input
        type="number"
        value={newItemPrice}
        onChange={(e) => setNewItemPrice(e.target.value)}
        placeholder={translations[language].pricePlaceholder}
        className="mr-2 border p-1"
      />
      <button
        onClick={handleSave}
        className="bg-green-500 text-white px-2 py-1 rounded"
      >
        {translations[language].save}
      </button>
    </div>
  );
};

export default Items;
