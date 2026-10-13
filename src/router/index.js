import { createRouter, createWebHistory } from "vue-router";

import { auth } from "../firebase";
import { waitForAuthReady } from "../composables/useAuth";
import { getUserProfile } from "../services/users";

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
      component: () => import("../views/LandingView.vue"),
    },

    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      meta: {
        guestOnly: true,
      },
    },

    {
      path: "/signup",
      name: "signup",
      component: () => import("../views/SignupView.vue"),
      meta: {
        guestOnly: true,
      },
    },

    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("../views/DashboardView.vue"),
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: "/admin",
      name: "admin",
      component: () => import("../views/AdminView.vue"),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
  ],
});

router.beforeEach(async (to) => {
  await waitForAuthReady();
  // Get the current user from Firebase Authentication
  const user = auth.currentUser;

  // If an authenticated user tries to open login or signup page
  // (which are guest-only pages), redirect them to the dashboard page
  if (to.meta.guestOnly && user) {
    return { name: "dashboard" };
  }
  
  // If a non-authenticated user tries to access a page that requires authentication,
  // redirect them to the login page
  if (to.meta.requiresAuth && !user) {
    return {
      name: "login",
      query: {
        redirect: to.fullPath,
      },
    };
  }
// If a user tries to access an admin page, check if they have the "admin" role
  if (to.meta.requiresAdmin) {
    const profile = await getUserProfile(user.uid);

    if (profile?.role !== "admin") {
      return { name: "dashboard" };
    }
  }

  return true;
});

export default router;