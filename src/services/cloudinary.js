// Cloud name and unsigned upload preset come from .env.
// The API secret is never used here, because frontend code is public
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Uploads an image file to a Cloudinary folder and returns its web address
async function uploadImage(file, folder) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    // Our Cloudinary account uses asset folders, so the folder is sent as "asset_folder"
    formData.append("asset_folder", folder);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Photo upload failed. Please try again.");
    }

    const data = await response.json();
    return data.secure_url;
}

// Profile pictures go to wearit/profile-pictures/{userId}
export function uploadProfilePicture(userId, file) {
    return uploadImage(file, `wearit/profile-pictures/${userId}`);
}

// Item photos go to wearit/wardrobes/{userId}/items
export function uploadItemPhoto(userId, file) {
    return uploadImage(file, `wearit/wardrobes/${userId}/items`);
}
