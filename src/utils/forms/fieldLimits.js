// The longest texts and biggest numbers the forms accept, used as maxlength and max on the inputs.
// Kept in one place, so the add item form and onboarding always allow the same
export const fieldLimits = {
    itemName: 60,
    brand: 40,
    notes: 500,
    tag: 20,
    outfitName: 60,
    username: 30,
    name: 60, // The name on the contact form
    email: 254, // The longest email address that exists
    message: 1000, // The contact form message
    search: 100,
    price: 100000, // Also the sale price
    timesWorn: 10000,
};

// Today as "2026-10-30", the format a date input uses. Used as max, so a purchase date can't be in the future.
// Built from the local date (not toISOString), so it's the right day also late in the evening
export function todayText() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
}
