import { onMounted, ref } from "vue";

import { listUsers } from "../services/users";

export function useAdminUsers() {
  const users = ref([]);
  const isLoading = ref(true);
  const errorMessage = ref("");

  const loadUsers = async () => {
    isLoading.value = true;
    errorMessage.value = "";

    try {
      users.value = await listUsers();
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : "Could not load users.";
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(loadUsers);

  return {
    users,
    isLoading,
    errorMessage,
    loadUsers,
  };
}