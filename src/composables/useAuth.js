import { computed, onMounted, onUnmounted, ref } from "vue";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useRouter } from "vue-router";

import { auth } from "../firebase";

export function useAuth() {
  const router = useRouter();

  // step 1 : create the reactive state for the login view
  const email = ref("");
  const password = ref("");
  const currentUser = ref(auth.currentUser);
  const isLoading = ref(false);
  const errorMessage = ref("");

  // Firebase will give us a function we can call later to stop listening.
  let removeAuthListener = null;

  const isSignedIn = computed(() => currentUser.value !== null);
  
  // the single ? is called the optional chaining operator. It means "if currentUser.value is not null or undefined, then get the email property, otherwise return undefined". The ?? operator is called the nullish coalescing operator. It means "if the left side is null or undefined, then return the right side".
  const userEmail = computed(() => currentUser.value?.email ?? ""); 

  const clearError = () => {
    errorMessage.value = "";
  };

  // step 4a : this runs every time Firebase notices a login/logout change
  const handleAuthChange = (user) => {
    currentUser.value = user;
  };

  // step 4b : start listening for auth changes
  const startAuthListener = () => {
    removeAuthListener = onAuthStateChanged(auth, handleAuthChange);
  };

  // step 4c : stop listening when this view is removed
  const stopAuthListener = () => {
    if (removeAuthListener) {
      removeAuthListener();
      removeAuthListener = null;
    }
  };

  // step 2 : sign in with Firebase Auth and then go to admin
  const login = async () => {
    clearError();
    isLoading.value = true;

    try {
      await signInWithEmailAndPassword(auth, email.value, password.value);
      password.value = "";
      await router.push("/admin");
    } catch (error) {
      errorMessage.value = error.message;
    } finally {
      isLoading.value = false;
    }
  };

  // step 3 : sign out the current user and go back to the login page
  const logout = async () => {
    clearError();
    isLoading.value = true;

    try {
      await signOut(auth);
      await router.push({ name: "login" });
    } catch (error) {
      errorMessage.value = error.message;
    } finally {
      isLoading.value = false;
    }
  };

  // step 4 : keep Vue state in sync with Firebase Auth
  onMounted(() => {
    startAuthListener();
  });

  onUnmounted(() => {
    stopAuthListener();
  });

  return {
    email,
    password,
    currentUser,
    isSignedIn,
    userEmail,
    isLoading,
    errorMessage,
    login,
    logout,
  };
}