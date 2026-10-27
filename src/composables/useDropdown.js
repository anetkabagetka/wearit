import { onBeforeUnmount, onMounted, ref } from "vue";

// Open/close state for small pop-up menus, like the admin "three dots" menu
// and the profile menu in the navigation. Clicking anywhere else closes the menu
export function useDropdown() {
    // Which menu is open (e.g. a user's ID or "account"), or null when all are closed
    const openMenu = ref(null);

    // Opens the menu, or closes it when it's already open
    const toggleMenu = (name) => {
        openMenu.value = openMenu.value === name ? null : name;
    };

    const closeMenu = () => {
        openMenu.value = null;
    };

    onMounted(() => document.addEventListener("click", closeMenu));
    onBeforeUnmount(() => document.removeEventListener("click", closeMenu));

    return { openMenu, toggleMenu, closeMenu };
}
