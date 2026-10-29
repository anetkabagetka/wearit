import { computed, ref } from "vue";
// Import Firebase authentication functions
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
// Import Firebase authentication and Google provider from firebase.js
import { auth, googleProvider } from "@/firebase";
import { getOrCreateUserProfile } from "@/services/users";
import { getAuthErrorMessage } from "@/utils/authErrorMessage";
// Reactive references for authentication state
const currentUser = ref(null);
const profile = ref(null);
const isLoading = ref(true);
const errorMessage = ref("");
// Username typed on the signup page, used once when the new profile is created
let pendingUsername = null;

// Loads (or creates) the signed-in user's profile and saves it in state.
// The router calls this before every page, so the profile is never stale
export async function refreshProfile() {
  const user = auth.currentUser;
  profile.value = user ? await getOrCreateUserProfile(user, pendingUsername) : null;
  // The profile exists now, so the signup username is no longer needed
  if (profile.value) {
    pendingUsername = null;
  }
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
      errorMessage.value = getAuthErrorMessage(error, "Login failed. Please try again.");
      throw error;
    }
  };
  // signup function
  const signup = async (email, password, username) => {
    // Clear any previous error messages
    clearError();
    // Remember the username before the account exists,
    // so it is ready when the profile gets created
    pendingUsername = username;
    // Attempt to create a new user with email and password
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      pendingUsername = null;
      errorMessage.value = getAuthErrorMessage(error, "Sign up failed. Please try again.");
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
      errorMessage.value = getAuthErrorMessage(error, "Google login failed. Please try again.");
      throw error;
    }
  };
  // Sends an email with a link to set a new password
  const resetPassword = async (email) => {
    clearError();

    try {
      // After setting the new password, the email's link brings the user back to our login page
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
      });
    } catch (error) {
      // Never reveal whether an account exists for this email, so treat "no account" as sent
      if (error?.code === "auth/user-not-found") {
        return;
      }
      errorMessage.value = getAuthErrorMessage(error, "Could not send the reset link. Please try again.");
      throw error;
    }
  };

  // Starts changing the login email. Firebase first sends a link to the NEW address,
  // and the email only changes after the user clicks it, so nobody can take over the account
  const changeEmail = async (newEmail) => {
    clearError();

    try {
      await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
    } catch (error) {
      errorMessage.value = getAuthErrorMessage(error, "Could not change your email. Please try again.");
      throw error;
    }
  };

  // Asks the user to prove it's really them before something serious, like deleting the account.
  // Email accounts type their password, Google accounts confirm in the Google window
  const confirmIdentity = async (password) => {
    clearError();

    try {
      const user = auth.currentUser;
      const isGoogleUser = user.providerData.some((provider) => provider.providerId === "google.com");

      if (isGoogleUser) {
        await reauthenticateWithPopup(user, googleProvider);
      } else {
        await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
      }
    } catch (error) {
      const wrongPassword = ["auth/invalid-credential", "auth/wrong-password"].includes(error?.code);
      errorMessage.value = wrongPassword
        ? "Your password is wrong."
        : getAuthErrorMessage(error, "Could not confirm it's you. Please try again.");
      throw error;
    }
  };
  // Deletes the login itself (Firebase Authentication). Call confirmIdentity first
  const deleteLoginAccount = async () => {
    clearError();

    try {
      await deleteUser(auth.currentUser);
    } catch (error) {
      errorMessage.value = getAuthErrorMessage(error, "Could not delete your account. Please try again.");
      throw error;
    }
  };
  // Changes the password. Firebase wants proof it's really you first,
  // so we log in again in the background with the current password
  const changePassword = async (currentPassword, newPassword) => {
    clearError();

    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    } catch (error) {
      // Here a wrong password can only mean the current password, so say exactly that
      const wrongPassword = ["auth/invalid-credential", "auth/wrong-password"].includes(error?.code);
      errorMessage.value = wrongPassword
        ? "Your current password is wrong."
        : getAuthErrorMessage(error, "Could not change your password. Please try again.");
      throw error;
    }
  };
  // logout function. The page that calls it decides where to go next
  const logout = async () => {
    clearError();

    try {
      await signOut(auth);
      window.location.href = "/login";
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
    resetPassword,
    logout,
    clearError,
    changeEmail,
    changePassword,
    confirmIdentity,
    deleteLoginAccount,
    logout,
  };
}
