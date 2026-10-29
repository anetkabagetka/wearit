// Import functions from Firebase which we use to read and save outfits
import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

// Saves a new outfit: a name plus 2 or more items from the wardrobe.
// Outfits live next to the items, in wardrobes/{userId}/outfits. Firestore creates the outfit's ID
export function addOutfit(userId, outfit) {
    return addDoc(collection(db, "wardrobes", userId, "outfits"), {
        name: outfit.name,
        itemIds: outfit.itemIds, // The IDs of its items, in the order they were picked
        tags: outfit.tags ?? [],
        timesWorn: 0, // The outfit's own wears. Its items still count their own wears too
        lastWornAt: null,
        wornDates: [],
        createdAt: serverTimestamp(),
    });
}

// Lists all outfits in one user's wardrobe
export async function listOutfits(userId) {
    const snapshot = await getDocs(collection(db, "wardrobes", userId, "outfits"));

    return snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
    }));
}