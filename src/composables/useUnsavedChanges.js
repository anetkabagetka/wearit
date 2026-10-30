import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { onBeforeRouteLeave } from "vue-router";

// Asks "Leave without saving?" when someone leaves a form with changes they haven't saved.
// hasUnsavedChanges is a computed from the form's composable, true while there's something to lose.
// The page shows UnsavedChangesDialog with isLeaveOpen and confirmLeave
export function useUnsavedChanges(hasUnsavedChanges) {
    const isLeaveOpen = ref(false);
    // The router waits on a Promise from the guard below. answer() finishes it: true = leave, false = stay
    let answer = null;

    // Runs before every link, back button or router.push away from this page
    onBeforeRouteLeave(() => {
        if (!hasUnsavedChanges.value) {
            return true;
        }
        isLeaveOpen.value = true;
        return new Promise((resolve) => {
            answer = resolve;
        });
    });

    // "Leave without saving" in the pop-up
    const confirmLeave = () => {
        answer?.(true);
        answer = null;
        isLeaveOpen.value = false;
    };

    // "Keep editing", the close button or Esc all close the pop-up, so they mean: stay on the page
    watch(isLeaveOpen, (open) => {
        if (!open) {
            answer?.(false);
            answer = null;
        }
    });

    // Closing the tab or reloading doesn't go through the router. The browser shows its own
    // "Leave site?" pop-up instead (it can't be styled, browsers don't allow it)
    const handleBeforeUnload = (event) => {
        if (hasUnsavedChanges.value) {
            event.preventDefault();
            // Older Safari only asks when returnValue is set too
            event.returnValue = "";
        }
    };

    onMounted(() => window.addEventListener("beforeunload", handleBeforeUnload));
    onBeforeUnmount(() => window.removeEventListener("beforeunload", handleBeforeUnload));

    return { isLeaveOpen, confirmLeave };
}
