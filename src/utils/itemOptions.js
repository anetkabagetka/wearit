// Choices for item fields, shared by onboarding and the add item page
export const categoryOptions = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories"];
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