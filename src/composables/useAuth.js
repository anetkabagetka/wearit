import { computed, ref } from "vue";
// Import Firebase authentication functions
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
// Import Firebase authentication and Google provider from firebase.js
import { auth, googleProvider } from "@/firebase";
import { getOrCreateUserProfile } from "@/services/users";
// Reactive references for authentication state
const currentUser = ref(null);
const profile = ref(null);
const isLoading = ref(true);
const errorMessage = ref("");

// Loads (or creates) the signed-in user's profile and saves it in state.
// The router calls this before every page, so the profile is never stale
export async function refreshProfile() {
  const user = auth.currentUser;
  profile.value = user ? await getOrCreateUserProfile(user) : null;
  return profile.value;
}

// Runs every time someone logs in or out, and keeps the state up to date.
// This file only runs once, so this listener is only added once
onAuthStateChanged(auth, async (user) => {
  currentUser.value = user;
  isLoading.value = true;

  try {
    await refreshProfile();
  } catch (error) {
    profile.value = null;
    errorMessage.value =
      error instanceof Error ? error.message : "Could not load user profile.";
  } finally {
    isLoading.value = false;
  }
});

export function useAuth() {
  const isSignedIn = computed(() => currentUser.value !== null);

  const isAdmin = computed(() => profile.value?.role === "admin");

  const userEmail = computed(() => currentUser.value?.email ?? "");

  const clearError = () => {
    errorMessage.value = "";
  };
  // login function
  const login = async (email, password) => {
    // Clear any previous error messages
    clearError();
    // Attempt to sign in the user with email and password
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : "Login failed.";
      throw error;
    }
  };
  // signup function
  const signup = async (email, password) => {
    // Clear any previous error messages
    clearError();
    // Attempt to create a new user with email and password
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : "Sign up failed.";
      throw error;
    }
  };
  // login with Google function
  const loginWithGoogle = async () => {
    // Clear any previous error messages
    clearError();
    // Attempt to sign in the user with Google popup
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : "Google login failed.";
      throw error;
    }
  };
  // logout function. The page that calls it decides where to go next
  const logout = async () => {
    clearError();

    try {
      await signOut(auth);
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : "Logout failed.";
      throw error;
    }
  };
  // Return functions and variables for use in components
  return {
    currentUser,
    profile,
    isSignedIn,
    isAdmin,
    userEmail,
    isLoading,
    errorMessage,
    login,
    signup,
    loginWithGoogle,
    logout,
    clearError,
  };
}
