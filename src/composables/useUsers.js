import { onMounted, ref } from "vue";

import { listUsers } from "../services/users";

// A composable is a reusable Vue function that bundles state and logic.
// Components can call useUsers() to get user data plus the code that loads it.
export function useUsers() {
  // non-ts ref & ts array ref with generic to make sure it keeps its reactive type. otherwise, it will be inferred as a non-reactive array.
  // const users = ref([]);
  // const users = ref<Array<{ id: string; name: string }>>([]);

  // refs create reactive state, so the template updates automatically
  // when these values change.
  const users = ref([]);

  const isLoading = ref(true);
  const errorMessage = ref("");

  // This function coordinates the request lifecycle for the UI:
  // start loading, fetch data, handle errors, then stop loading.
  const loadUsers = async () => {
    isLoading.value = true;
    errorMessage.value = "";

    try {
      // The actual Firestore query lives in the service layer.
      // The composable stays focused on UI state and orchestration.
      users.value = await listUsers();
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : "Could not load users.";
    } finally {
      isLoading.value = false;
    }
  };


  // onMounted runs after the component using this composable is mounted.
  // That makes it a good place to kick off the first fetch.
  onMounted(loadUsers);

  return {
    users,
    isLoading,
    errorMessage,
    loadUsers,
  };
}