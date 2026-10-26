// Import functions from Firebase which we will use to read and save
// the wardrobe, its items and profile changes
import {
    addDoc,
    collection,
    collectionGroup,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    writeBatch,
} from "firebase/firestore";
import { db } from "@/firebase";

// Turns an item from a form into the shape we save in Firestore.
// Onboarding and the add item page both use it, so every item looks the same
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
        lastWornAt: null,
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
        batch.set(itemRef, toItemData(item));
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

// Adds a new item to the user's wardrobe. Firestore creates the item's ID
export function addItem(userId, item) {
    return addDoc(collection(db, "wardrobes", userId, "items"), toItemData(item));
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