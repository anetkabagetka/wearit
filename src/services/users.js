import {
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
  updateDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
// Use database from firbase.js
import { db } from "@/firebase";
// Reference to the "users" collection in Firestore
const usersCollection = collection(db, "users");
// Gets user profile from Firestore by user ID
export async function getUserProfile(userId) {
  const userDocument = doc(db, "users", userId);
  const snapshot = await getDoc(userDocument);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}
// Creates a new user profile in Firestore
export async function createUserProfile(user, username = null) {
  const userDocument = doc(db, "users", user.uid);

  await setDoc(userDocument, {
    role: "user",
    username,
    wardrobeId: null, // By default, the user has no wardrobe
    onboardingCompleted: false, // By default, onboarding is not completed for new users
    createdAt: serverTimestamp(),
  });
}
// Gets or creates a user profile in Firestore.
// signupUsername is the username typed on the signup page, if there is one
export async function getOrCreateUserProfile(user, signupUsername = null) {
  const existingUser = await getUserProfile(user.uid);

  if (existingUser) {
    // If the user already exists, update their email if it's not set
    if (!existingUser.email && user.email) {
      await updateDoc(doc(db, "users", user.uid), {
        email: user.email,
      });
    }
    return existingUser;
  }

  const isGoogleUser = user.providerData.some(
    (provider) => provider.providerId === "google.com",
  );
  // If the user is signing in with Google, use their display name
  // or email as the username
  const googleUsername = isGoogleUser
    ? user.displayName || user.email?.split("@")[0] || null
    : null;

  await createUserProfile(user, signupUsername || googleUsername);

  return getUserProfile(user.uid);
}
// Lists all user profiles in the user document
export async function listUsers() {
  const snapshot = await getDocs(usersCollection);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

// Change a users role to admin or user.
export function updateUserRole(userId, role) {
  return updateDoc(doc(db, "users", userId), {
    role,
  });
}

// Deletes everything a user has in Firestore: their items, their wardrobe and their profile.
// writeBatch means either everything is deleted or nothing is.
// Their login (Firebase Authentication) and Cloudinary photos are NOT deleted here
export async function deleteUserData(userId) {
  const batch = writeBatch(db);
  const wardrobeRef = doc(db, "wardrobes", userId);

  // Firestore doesn't delete sub-collections automatically, so delete each item first
  const itemsSnapshot = await getDocs(collection(wardrobeRef, "items"));
  for (const itemDocument of itemsSnapshot.docs) {
    batch.delete(itemDocument.ref);
  }

  batch.delete(wardrobeRef);
  batch.delete(doc(db, "users", userId));

  await batch.commit();
}

// Saves changes to the user's profile, e.g. { username: "Aneta", photoUrl: "https://..." }
export function updateUserProfile(userId, changes) {
  return updateDoc(doc(db, "users", userId), changes);
}