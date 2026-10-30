// Turns the browser's built-in check result for an input into a friendly message.
// The checks themselves come from the HTML: required, type="email", min, max, minlength, pattern...
export function getValidationMessage(control) {
    const { validity } = control;

    if (validity.valid) {
        return "";
    }
    if (validity.valueMissing) {
        return control.type === "radio" || control.type === "checkbox"
            ? "Please choose an option."
            : "This field is required.";
    }
    if (validity.typeMismatch && control.type === "email") {
        return "Please enter a valid email address, e.g. name@example.com.";
    }
    if (validity.badInput) {
        return "Please enter a valid number.";
    }
    if (validity.tooShort) {
        return `Use at least ${control.minLength} characters.`;
    }
    if (validity.rangeUnderflow) {
        return `Must be at least ${control.min}.`;
    }
    if (validity.rangeOverflow) {
        // A date input's max is today, e.g. the purchase date
        return control.type === "date" ? "The date can't be in the future." : `Must be ${control.max} or less.`;
    }
    if (validity.stepMismatch) {
        // step="1" means whole numbers only, e.g. times worn
        return control.step === "1" ? "Please use a whole number." : "Please use at most 2 decimal places.";
    }
    if (validity.patternMismatch) {
        // The input's title attribute explains what the pattern expects
        return control.title || "Please check the format.";
    }
    return control.validationMessage;
}
