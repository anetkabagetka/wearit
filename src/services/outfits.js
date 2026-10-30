// Import functions from Firebase which we use to read and save outfits
import {
    addDoc,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    increment,
    serverTimestamp,
    updateDoc,
    writeBatch,
} from "firebase/firestore";
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

// Gets one outfit, or null if it doesn't exist
export async function getOutfit(userId, outfitId) {
    const snapshot = await getDoc(doc(db, "wardrobes", userId, "outfits", outfitId));

    if (!snapshot.exists()) {
        return null;
    }

    return {
        id: snapshot.id,
        ...snapshot.data(),
    };
}

// Saves a changed name, items or tags. The outfit's wears stay as they were
export function updateOutfit(userId, outfitId, outfit) {
    return updateDoc(doc(db, "wardrobes", userId, "outfits", outfitId), {
        name: outfit.name,
        itemIds: outfit.itemIds,
        tags: outfit.tags ?? [],
        updatedAt: serverTimestamp(),
    });
}

// "Log outfit": one more wear for the outfit and for each item in itemIds.
// writeBatch saves them all together, or none of them if something goes wrong
export async function logOutfitWear(userId, outfitId, itemIds) {
    const batch = writeBatch(db);
    const wardrobeRef = doc(db, "wardrobes", userId);

    // The same three changes markItemWorn makes to an item
    const wear = {
        timesWorn: increment(1),
        lastWornAt: serverTimestamp(),
        wornDates: arrayUnion(new Date()),
    };

    batch.update(doc(wardrobeRef, "outfits", outfitId), wear);
    for (const itemId of itemIds) {
        batch.update(doc(wardrobeRef, "items", itemId), wear);
    }

    await batch.commit();
}

// Deletes an outfit. Its items and their wears stay in the wardrobe
export function deleteOutfit(userId, outfitId) {
    return deleteDoc(doc(db, "wardrobes", userId, "outfits", outfitId));
}