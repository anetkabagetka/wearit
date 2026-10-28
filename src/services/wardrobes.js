// Import functions from Firebase which we will use to read and save
// the wardrobe, its items and profile changes
import {
    addDoc,
    arrayUnion,
    collection,
    collectionGroup,
    doc,
    getDoc,
    deleteDoc,
    getDocs,
    increment,
    serverTimestamp,
    updateDoc,
    writeBatch,
} from "firebase/firestore";
import { db } from "@/firebase";

// Turns an item from a form into the shape we save in Firestore.
// Onboarding, add item and edit item all use it, so every item looks the same
function toItemData(item) {
    return {
        name: item.name,
        category: item.category,
        brand: item.brand || null, // Optional fields are saved as null when they're empty
        color: item.color || null,
        season: item.season || null,
        price: item.price,
        purchaseDate: item.purchaseDate || null,
        timesWorn: Number(item.timesWorn) || 0, // An empty field counts as 0 wears
        tags: item.tags ?? [],
        notes: item.notes || null,
        photoUrl: item.photoUrl || null, // Cloudinary address of the photo, or null without a photo
    };
}

// Fields only a brand new item gets. Editing must not reset them
function newItemFields() {
    return {
        lastWornAt: null,
        wornDates: [], // Wear history: the date of every wear logged with "Log a wear"
        createdAt: serverTimestamp(),
    };
}

// Saves the wardrobe, first item and profile changes together.
// writeBatch means either everything is saved or nothing is
export async function completeOnboarding(userId, { currency, item, goals, targetCostPerWear }) {
    const batch = writeBatch(db);
    // The wardrobe uses the user's ID, so each user has exactly one wardrobe
    const wardrobeRef = doc(db, "wardrobes", userId);

    // Save/Create the wardrobe and set the ownerId, currency and createdAt fields
    batch.set(wardrobeRef, {
        ownerId: userId,
        currency,
        goals,
        targetCostPerWear,
        createdAt: serverTimestamp(),
    });

    // Only if user didnt skip adding item, save the first item in the wardrobe
    if (item) {
        const itemRef = doc(collection(wardrobeRef, "items"));
        batch.set(itemRef, { ...toItemData(item), ...newItemFields() });
    }

    // Update the user's profile with the wardrobeId
    // and onboardingCompleted changes to true
    batch.update(doc(db, "users", userId), {
        wardrobeId: userId,
        onboardingCompleted: true,
    });

    // Commit the batch to save all changes together
    await batch.commit();
}

// Gets one user's wardrobe (currency, goals...), or null if they don't have one yet
export async function getWardrobe(userId) {
    const snapshot = await getDoc(doc(db, "wardrobes", userId));

    if (!snapshot.exists()) {
        return null;
    }

    return {
        id: snapshot.id,
        ...snapshot.data(),
    };
}

// Changes the wardrobe's currency and saves the converted goal and item prices.
// items is a list of { id, price } with the new prices.
// writeBatch means either everything is saved or nothing is (max 500 changes per batch)
export async function changeWardrobeCurrency(userId, { currency, targetCostPerWear, items }) {
    const batch = writeBatch(db);
    const wardrobeRef = doc(db, "wardrobes", userId);

    batch.update(wardrobeRef, { currency, targetCostPerWear });

    for (const item of items) {
        batch.update(doc(wardrobeRef, "items", item.id), { price: item.price });
    }

    await batch.commit();
}

// Adds a new item to the user's wardrobe. Firestore creates the item's ID
export function addItem(userId, item) {
    return addDoc(collection(db, "wardrobes", userId, "items"), {
        ...toItemData(item),
        ...newItemFields(),
    });
}

// Lists all items in one user's wardrobe
export async function listItems(userId) {
    const snapshot = await getDocs(collection(db, "wardrobes", userId, "items"));

    return snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
    }));
}

// Gets one item from the user's wardrobe, or null if it doesn't exist
export async function getItem(userId, itemId) {
    const snapshot = await getDoc(doc(db, "wardrobes", userId, "items", itemId));

    if (!snapshot.exists()) {
        return null;
    }

    return {
        id: snapshot.id,
        ...snapshot.data(),
    };
}

// Saves the changes to an item. createdAt and lastWornAt stay as they were
export function updateItem(userId, itemId, item) {
    return updateDoc(doc(db, "wardrobes", userId, "items", itemId), {
        ...toItemData(item),
        updatedAt: serverTimestamp(),
    });
}

// Adds 1 to an items wear count, remembers that it was worn now,
// and adds the date to its wear history (wornDates).
// increment(1) and arrayUnion let Firestore change the count and the list itself, so no wear gets lost
export function markItemWorn(userId, itemId) {
    return updateDoc(doc(db, "wardrobes", userId, "items", itemId), {
        timesWorn: increment(1),
        lastWornAt: serverTimestamp(),
        wornDates: arrayUnion(new Date()),
    });
}

// Takes an item out of the wardrobe because it was sold, donated or given away.
// The item isn't deleted, so its wear history and final cost per wear are kept
export function markItemRemoved(userId, itemId, { reason, salePrice }) {
    return updateDoc(doc(db, "wardrobes", userId, "items", itemId), {
        removedAs: reason, // "sold", "donated" or "gave-away"
        salePrice, // Only for "sold", otherwise null
        removedAt: serverTimestamp(),
    });
}

// Deletes one item. Its photo stays in Cloudinary (deleting it needs the API secret)
export function deleteItem(userId, itemId) {
    return deleteDoc(doc(db, "wardrobes", userId, "items", itemId));
}

// Lists all items from all wardrobes in the database
export async function listAllItems() {
    // collectionGroup finds EVERY collection called "items", also ones outside a wardrobe
    const snapshot = await getDocs(collectionGroup(db, "items"));

    return snapshot.docs
        // Keep only items inside a wardrobe (wardrobes/{uid}/items). Others have no
        // parent document, so reading .id on it would crash
        .filter((document) => document.ref.parent.parent !== null)
        // Put the data in an array of items, including the ownerId from the parent wardrobe
        .map((document) => ({
            ownerId: document.ref.parent.parent.id,
            ...document.data(),
        }));
}