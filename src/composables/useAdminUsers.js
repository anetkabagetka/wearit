import { onMounted, ref, computed } from "vue";

import { deleteUserData, listUsers, updateUserRole } from "@/services/users";
import { listAllItems } from "@/services/wardrobes";

export function useAdminUsers() {
  const users = ref([]);
  const items = ref([]);
  const isLoading = ref(true);
  const errorMessage = ref("");
  const search = ref("");
  const roleFilter = ref("all");

  const loadUsers = async () => {
    isLoading.value = true;
    errorMessage.value = "";

    try {
      users.value = await listUsers();
      items.value = await listAllItems();
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : "Could not load users.";
    } finally {
      isLoading.value = false;
    }
  };

  // numbers for the three cards on top
  const stats = computed(() => {
    const weekAgo = new Date() - 7 * 24 * 60 * 60 * 1000; // 7 days ago
    const activeUsers = new Set(
      items.value
        .filter((item) => item.lastWornAt?.toMillis() > weekAgo)
        .map((item) => item.ownerId),
    );
    return {
      users: users.value.length,
      newThisWeek: users.value.filter(
        (user) => user.createdAt?.toMillis() > weekAgo,
      ).length,
      active: activeUsers.size,
      activePercent: users.value.length
        ? Math.round((activeUsers.size / users.value.length) * 100)
        : 0,
      items: items.value.length,
      wears: items.value.reduce((total, item) => total + (item.timesWorn || 0), 0),
    };
  });

  // Users that match the search bar and the chosen chip (role filter)
  const visibleUsers = computed(() => {
    const text = search.value.toLowerCase();

    return users.value.filter((user) => {
      const matchesRole = roleFilter.value === "all" || user.role === roleFilter.value;
      const matchesText = `${user.username ?? ""} ${user.email ?? ""}`.toLowerCase().includes(text);
      return matchesRole && matchesText;
    });
  });

  // How many items user has in their wardrobe
  const countItems = (userId) =>
    items.value.filter((item) => item.ownerId === userId).length;

  // Change a users role to admin or user.
  // The admin page asks first, in its "Make … an admin?" pop-up
  const toggleRole = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";

    try {
      await updateUserRole(user.id, newRole);
      user.role = newRole;
    } catch {
      errorMessage.value = `Could not change the role. Please try again.`;
    }
  }

  // Delete a user's profile, wardrobe and items from Firestore.
  // The admin page asks first, in its "Delete user?" pop-up
  const deleteUser = async (user) => {
    const name = user.username || user.email || "this user";

    errorMessage.value = "";

    try {
      await deleteUserData(user.id);
      // Remove them from the lists on the page too, so the numbers update right away
      users.value = users.value.filter((otherUser) => otherUser.id !== user.id);
      items.value = items.value.filter((item) => item.ownerId !== user.id);
    } catch {
      errorMessage.value = `Could not delete ${name}. Please try again.`;
    }
  };

  onMounted(loadUsers);

  return {
    users,
    isLoading,
    errorMessage,
    loadUsers,
    search,
    roleFilter,
    visibleUsers,
    countItems,
    toggleRole,
    deleteUser,
    stats,
  };
}