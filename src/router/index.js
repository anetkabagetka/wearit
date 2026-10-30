import { createRouter, createWebHistory } from "vue-router";

import { auth } from "@/firebase";
import { refreshProfile } from "@/composables/useAuth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: "/",
      redirect: { name: "landing" },
    },

    {
      path: "/landing",
      name: "landing",
      component: () => import("@/views/LandingView.vue"),
      // The landing page is for guests, so logged-in users who open the site go to their dashboard
      meta: {
        guestOnly: true,
      },
    },

    {
      path: "/about-us",
      name: "about",
      component: () => import("@/views/AboutView.vue"),
      meta: {
        tab: "about",
      },
    },

    {
      path: "/support-contact",
      name: "support-contact",
      component: () => import("@/views/ContactView.vue"),
      meta: {
        tab: "support",
      },
    },

    {
      path: "/reset-password",
      name: "reset-password",
      component: () => import("@/views/auth/ResetPasswordView.vue"),
      meta: {
        guestOnly: true,
      },
    },

    {
      path: "/check-email",
      name: "check-email",
      component: () => import("@/views/auth/CheckEmailView.vue"),
      meta: { guestOnly: true },
    },

    {
      path: "/login",
      name: "login",
      component: () => import("@/views/auth/LoginView.vue"),
      meta: {
        guestOnly: true,
      },
    },

    {
      path: "/signup",
      name: "signup",
      component: () => import("@/views/auth/SignupView.vue"),
      meta: {
        guestOnly: true,
      },
    },

    {
      path: "/onboarding",
      name: "onboarding",
      component: () => import("@/views/OnboardingView.vue"),
      meta: {
        requiresAuth: true,
      },
    },

    // meta.tab = which nav link gets highlighted on this page (Navigation.vue).
    // Pages under a section, like an item or a settings page, use their section's tab
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("@/views/user/DashboardView.vue"),
      meta: {
        tab: "home",
        requiresAuth: true,
      },
    },

    {
      path: "/wardrobe",
      name: "wardrobe",
      component: () => import("@/views/user/WardrobeView.vue"),
      meta: {
        tab: "wardrobe",
        requiresAuth: true,
      },
    },

    {
      path: "/insights",
      name: "insights",
      component: () => import("@/views/user/InsightsView.vue"),
      meta: {
        tab: "insights",
        requiresAuth: true,
      },
    },

    {
      path: "/settings",
      name: "settings",
      component: () => import("@/views/user/settings/MainSettingsView.vue"),
      meta: {
        tab: "settings",
        requiresAuth: true,
      },
    },

    {
      path: "/settings/edit-profile",
      name: "settings-edit-profile",
      component: () => import("@/views/user/settings/EditProfileView.vue"),
      meta: {
        tab: "settings",
        requiresAuth: true,
      },
    },

    {
      path: "/settings/change-password",
      name: "settings-change-password",
      component: () => import("@/views/user/settings/ChangePasswordView.vue"),
      meta: {
        tab: "settings",
        requiresAuth: true,
      },
    },

    {
      path: "/settings/delete-account",
      name: "settings-delete-account",
      component: () => import("@/views/user/settings/DeleteAccountView.vue"),
      meta: {
        tab: "settings",
        requiresAuth: true,
      },
    },

    {
      path: "/settings/currency",
      name: "settings-currency",
      component: () => import("@/views/user/settings/CurrencySettingsView.vue"),
      meta: {
        tab: "settings",
        requiresAuth: true,
      },
    },

    {
      path: "/settings/notifications",
      name: "settings-notifications",
      component: () => import("@/views/user/settings/NotificationSettingsView.vue"),
      meta: {
        tab: "settings",
        requiresAuth: true,
      },
    },

    {
      path: "/settings/theme",
      name: "settings-theme",
      component: () => import("@/views/user/settings/ThemeSettingsView.vue"),
      meta: {
        tab: "settings",
        requiresAuth: true,
      },
    },

    {
      path: "/item/:itemId",
      name: "item",
      component: () => import("@/views/user/items/ItemDetailView.vue"),
      meta: {
        tab: "wardrobe",
        requiresAuth: true,
      },
    },

    {
      path: "/add-item",
      name: "add-item",
      component: () => import("@/views/user/items/AddItemView.vue"),
      meta: {
        requiresAuth: true
      },
    },

    {
      path: "/create-outfit",
      name: "create-outfit",
      component: () => import("@/views/user/outfits/CreateOutfitView.vue"),
      meta: {
        tab: "wardrobe",
        requiresAuth: true,
      },
    },

    {
      path: "/outfit/:outfitId",
      name: "outfit",
      component: () => import("@/views/user/outfits/OutfitDetailView.vue"),
      meta: {
        tab: "wardrobe",
        requiresAuth: true,
      },
    },

    {
      path: "/edit-outfit/:outfitId",
      name: "edit-outfit",
      component: () => import("@/views/user/outfits/EditOutfitView.vue"),
      meta: {
        tab: "wardrobe",
        requiresAuth: true,
      },
    },

    {
      path: "/edit-item/:itemId",
      name: "edit-item",
      component: () => import("@/views/user/items/EditItemView.vue"),
      meta: {
        tab: "wardrobe",
        requiresAuth: true,
      },
    },

    {
      path: "/profile",
      name: "profile",
      component: () => import("@/views/user/ProfileView.vue"),
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: "/admin",
      name: "admin",
      component: () => import("@/views/admin/AdminView.vue"),
      meta: {
        tab: "admin",
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
  ],
});

router.beforeEach(async (to) => {
  // Built-in Firebase: waits until it knows if someone is logged in (after a page reload)
  await auth.authStateReady();
  // Get the current user from Firebase Authentication
  const user = auth.currentUser;

  // Logged-in users can't open the landing, login or signup pages
  if (to.meta.guestOnly && user) {
    return { name: "dashboard" };
  }

  // Guests trying to open a protected page go to login first
  if (to.meta.requiresAuth && !user) {
    return {
      name: "login",
      query: {
        redirect: to.fullPath,
      },
    };
  }

  // Guests need no more checks
  if (!user) {
    return true;
  }

  // Load the profile here, so we never check an old or missing one
  const profile = await refreshProfile();

  // Users who haven't finished onboarding are always sent there
  if (!profile?.onboardingCompleted && to.name !== "onboarding") {
    return { name: "onboarding" };
  }

  // Onboarding only happens once
  if (profile?.onboardingCompleted && to.name === "onboarding") {
    return { name: "dashboard" };
  }

  // Only admins can open admin pages
  if (to.meta.requiresAdmin && profile?.role !== "admin") {
    return { name: "dashboard" };
  }

  return true;
});

export default router;