// Import functions from Firebase which we will use to save 
// the wardrobe, first item and profile changes together
import { collection, collectionGroup, doc, getDocs, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "@/firebase";

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

        // Save the first item in the wardrobe
    batch.set(itemRef, {
        name: item.name,
        category: item.category,
        brand: item.brand || null, // Brand is optional, so save null when it's empty
        price: item.price,
        purchaseDate: item.purchaseDate || null,
        timesWorn: item.timesWorn,
        photoUrl: item.photoUrl || null, // Cloudinary address of the photo, or null without a photo
        lastWornAt: null,
        createdAt: serverTimestamp(),
    });
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