// Checks every field in a form before it is submitted.
// Each invalid field fires an "invalid" event, which FormField uses to show its error.
// The first invalid field gets focus, so the user sees right away what to fix
export function isFormValid(form) {
    const isValid = form.checkValidity();

    if (!isValid) {
        form.querySelector("input:invalid, select:invalid, textarea:invalid")?.focus();
    }

    return isValid;
}
