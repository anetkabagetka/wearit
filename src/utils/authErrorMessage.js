// Turns a Firebase login/signup error into a message a user understands.
// Firebase errors have a code like "auth/invalid-credential"
const messages = {
    "auth/invalid-credential": "Wrong email or password.",
    "auth/wrong-password": "Wrong email or password.",
    "auth/user-not-found": "Wrong email or password.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/email-already-in-use": "An account with this email already exists. Try logging in instead.",
    "auth/weak-password": "This password is too weak. Use at least 8 characters, including a number and a symbol.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "No internet connection. Please check it and try again.",
    // Closing the Google window yourself is not an error, so show nothing
    "auth/popup-closed-by-user": "",
    "auth/cancelled-popup-request": "",
    "auth/missing-email": "Please enter your email address.",
    "auth/unauthorized-continue-uri": "This website address isn't allowed in Firebase yet. Add it under Authentication → Settings → Authorized domains.",
    "auth/popup-blocked": "Your browser blocked the Google window. Please allow pop-ups and try again.",
};

export function getAuthErrorMessage(error, fallback = "Something went wrong. Please try again.") {
    return messages[error?.code] ?? fallback;
}
