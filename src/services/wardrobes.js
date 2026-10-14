// Import functions from Firebase which we will use to save 
// the wardrobe, first item and profile changes together
import { collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../firebase";

// Saves the wardrobe, first item and profile changes together.
// writeBatch means either everything is saved or nothing is
export async function completeOnboarding(userId, { username, currency, item }) {
    const batch = writeBatch(db);
    // The wardrobe uses the user's ID, so each user has exactly one wardrobe
    const wardrobeRef = doc(db, "wardrobes", userId);
    // doc() on a collection without an ID creates a new random ID for the item
    const itemRef = doc(collection(wardrobeRef, "items"));

    // Save/Create the wardrobe and set the ownerId, currency and createdAt fields
    batch.set(wardrobeRef, {
        ownerId: userId,
        currency,
        createdAt: serverTimestamp(),
    });

    // Save the first item in the wardrobe
    batch.set(itemRef, {
        name: item.name,
        category: item.category,
        price: item.price,
        purchaseDate: item.purchaseDate || null,
        timesWorn: item.timesWorn,
        lastWornAt: null,
        createdAt: serverTimestamp(),
    });

    // Update the user's profile with the username, wardrobeId 
    // and onboardingCompleted changes to true
    batch.update(doc(db, "users", userId), {
        username,
        wardrobeId: userId,
        onboardingCompleted: true,
    });

    // Commit the batch to save all changes together
    await batch.commit();
}
