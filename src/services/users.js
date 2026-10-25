import {
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
  serverTimestamp,
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