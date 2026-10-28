<script setup>
import Navigation from "@/components/Navigation.vue";
import { useAdminUsers } from "@/composables/useAdminUsers";
import { useAuth } from "@/composables/useAuth";
import { useDropdown } from "@/composables/useDropdown";
import { getInitials } from '@/utils/getInitials'

import chevronLeftIcon from "@/assets/icons/chevron-left.svg";
import searchIcon from "@/assets/icons/search.svg";
import moreIcon from "@/assets/icons/more.svg";

const {
  isLoading,
  errorMessage,
  search,
  roleFilter,
  stats,
  visibleUsers,
  countItems,
  toggleRole,
  deleteUser,
} = useAdminUsers();
const { currentUser } = useAuth();

// Which user's "more" menu is open. Clicking anywhere else closes it
const { openMenu, toggleMenu, closeMenu } = useDropdown();

// Runs a menu option, then closes the menu
const chooseOption = (action, user) => {
  closeMenu();
  action(user);
};


// First letter of the name capitalized
const initials = (name) => getInitials(name);
</script>

<template>
  <Navigation />

  <main class="container admin-page stack">
    <div class="top-bar">
      <router-link to="/admin" class="back-button" aria-label="Back">
        <img :src="chevronLeftIcon" alt="" />
      </router-link>
      <h1 class="title-m">Admin</h1>
    </div>

    <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

    <p v-if="isLoading">Loading users...</p>

    <template v-else>
      <div class="stats">
        <div class="stat-card">
          <span class="field-label">Users</span>
          <strong class="stat-value">{{ stats.users }}</strong>
          <span class="caption">+{{ stats.newThisWeek }} this week</span>
        </div>
        <div class="stat-card">
          <span class="field-label">Active this week</span>
          <strong class="stat-value">{{ stats.active }}</strong>
          <span class="caption">{{ stats.activePercent }}% of all users</span>
        </div>
        <div class="stat-card items-tracked">
          <span class="field-label">Items tracked</span>
          <strong class="stat-value">{{ stats.items }}</strong>
          <span class="caption">{{ stats.wears }} wears logged</span>
        </div>
      </div>

      <div class="stack-small">
        <label class="input-icon search">
          <img :src="searchIcon" alt="" width="20" height="20" />
          <input type="text" v-model="search" placeholder="Search users" aria-label="Search users" />
        </label>

        <div class="chips">
          <label class="chip"><input v-model="roleFilter" type="radio" name="role" value="all" />All</label>
          <label class="chip"><input v-model="roleFilter" type="radio" name="role" value="admin" />Admins</label>
          <label class="chip"><input v-model="roleFilter" type="radio" name="role" value="user" />Users</label>
        </div>
      </div>

      <section>
        <h2 class="title-m">All users · {{ visibleUsers.length }}</h2>

        <ul class="user-list">
          <li v-for="user in visibleUsers" :key="user.id" class="user-row">
            <span class="avatar">{{ initials(user.username || user.email || "?") }}</span>

            <div class="user-text">
              <span>{{ user.username || "No username" }}</span>
              <span class="caption">{{ user.email || "No email" }} · {{ countItems(user.id) }} items</span>
            </div>

            <span class="chip" :class="{ 'chip-selected': user.role === 'admin' }">
              {{ user.role === "admin" ? "Admin" : "User" }}
            </span>

            <!-- Disabled on my own row, so I can't remove my admin role or delete myself.
                 .stop keeps the click from reaching the page, which would close the menu again -->
            <div class="menu-wrapper" @click.stop @keydown.esc="closeMenu">
              <button type="button" class="more-button" :aria-label="`Options for ${user.username || user.email}`"
                aria-haspopup="menu" :aria-expanded="openMenu === user.id"
                :disabled="user.id === currentUser?.uid" @click="toggleMenu(user.id)">
                <img :src="moreIcon" alt="" width="20" height="20" />
              </button>

              <div v-if="openMenu === user.id" class="menu" role="menu">
                <button type="button" role="menuitem" @click="chooseOption(toggleRole, user)">
                  {{ user.role === "admin" ? "Make user" : "Make admin" }}
                </button>
                <button type="button" role="menuitem" class="menu-danger" @click="chooseOption(deleteUser, user)">
                  Delete user
                </button>
              </div>
            </div>
          </li>
        </ul>
      </section>
    </template>
  </main>
</template>

<style scoped>
.admin-page {
  padding-top: 24px;
  padding-bottom: 80px;
}

.items-tracked {
  color: var(--white);
  background-color: var(--black);

  .field-label,
  .caption {
    color: var(--white);
  }
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  border: 1px solid var(--light-gray);
  border-radius: 8px;
}

.stat-card-inverse {
  grid-column: 1 / -1;
  background-color: var(--black);
  border-color: var(--black);
}

.stat-card-inverse * {
  color: var(--white);
}

@media (min-width: 768px) {
  .stats {
    grid-template-columns: 1fr 1fr 1fr;
  }

  .stat-card-inverse {
    grid-column: auto;
  }
}

.stat-value {
  font-family: var(--font-title);
  font-weight: normal;
  font-size: 24px;
}

.user-list {
  list-style: none;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--light-gray);
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--light-gray);
  font-size: 13px;
  font-weight: 500;
}

/* min-width: 0 lets long emails get cut off with "..." instead of pushing the row wider */
.user-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.more-button {
  display: flex;
  padding: 4px;
  background: none;
  border: none;
  cursor: pointer;
}

.more-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>