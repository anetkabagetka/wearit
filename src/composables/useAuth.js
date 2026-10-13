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
import { auth, googleProvider } from "../firebase";
import { getOrCreateUserProfile } from "../services/users";
// Reactive references for authentication state
const currentUser = ref(null);
const profile = ref(null);
const isLoading = ref(true);
const errorMessage = ref("");

let authInitialized = false;
let resolveAuthReady;
// Promise to indicate when authentication state is ready
const authReadyPromise = new Promise((resolve) => {
  resolveAuthReady = resolve;
});
// Starts listening for authentication state changes 
// and updates the reactive references accordingly
const initializeAuth = () => {
  if (authInitialized) {
    return;
  }

  authInitialized = true;

  onAuthStateChanged(auth, async (user) => {
    // Update the current user and loading state
    currentUser.value = user;
    isLoading.value = true;
    // If the user is signed in, get or create their profile in Firestore
    try {
      profile.value = user
        ? await getOrCreateUserProfile(user)
        : null;
    } catch (error) {
      profile.value = null;
      errorMessage.value =
        error instanceof Error ? error.message : "Could not load user profile.";
    } finally {
      isLoading.value = false;
      resolveAuthReady();
    }
  });
};

initializeAuth();

export function waitForAuthReady() {
  return authReadyPromise;
}
// 
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
  // logout function
  const logout = async () => {
    // Clear any previous error messages
    clearError();
  // Attempt to sign out the user
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : "Logout failed.";
      throw error;
    }
  };
// Return functions and variablesfor use in components
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
