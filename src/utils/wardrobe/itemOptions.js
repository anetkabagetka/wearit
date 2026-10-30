// Choices for item fields, shared by onboarding and the add item page
export const clothingOptions = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes"];
// Accessories are saved as one of these more specific kinds, picked from a group in the Category select
export const accessoryOptions = ["Gloves", "Hat", "Cap", "Ring", "Necklace", "Earrings", "Bag"];
// The main categories, for the filters, the outfit form and Insights
export const categoryOptions = [...clothingOptions, "Accessories"];
export const colorOptions = ["Black", "White", "Grey", "Beige", "Brown", "Blue", "Green", "Red", "Pink", "Multi"];
export const seasonOptions = ["All year", "Spring", "Summer", "Autumn", "Winter"];
// Tags every user starts with. They can add their own on the add item page
export const defaultTags = ["Work", "Date night", "Gift"];

// Why an item left the wardrobe, for the "Remove from wardrobe" pop-up on the item page
export const removeOptions = [
    { value: "sold", label: "Sold", description: "Record the sale price" },
    { value: "donated", label: "Donated", description: "Gave it to a charity shop or clothes bank" },
    { value: "gave-away", label: "Gave away", description: "Passed on to a friend or family" },
];
// The CPW slider in the Filters pop-up goes from 0 to this. At the very top it means "and more"
export const cpwSliderMax = 50;

// The main category of an item: "Hat" or "Bag" count as "Accessories", the rest stay as they are.
// Items saved before the accessory kinds existed are just "Accessories"
export function mainCategory(category) {
    return accessoryOptions.includes(category) ? "Accessories" : category;
}
