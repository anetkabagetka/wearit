// After a new version is deployed, the page files get new names and the old ones are gone.
// A tab that was opened before still asks for the old names, and loading a page then fails
// ("Failed to fetch dynamically imported module"). Reloading fetches the new version.

// The texts browsers use for that error: Chrome, Firefox and Safari
const messages = [
    "Failed to fetch dynamically imported module",
    "error loading dynamically imported module",
    "Importing a module script failed",
];

export function isNewVersionError(error) {
    return messages.some((message) => String(error?.message).includes(message));
}

// Loads the page again from the server, e.g. the page the user was going to.
// Only once per 10 seconds, so being offline doesn't make the page reload forever
export function reloadForNewVersion(path = window.location.pathname) {
    try {
        const lastReload = Number(sessionStorage.getItem("newVersionReload"));
        if (Date.now() - lastReload < 10000) {
            return false;
        }
        sessionStorage.setItem("newVersionReload", String(Date.now()));
    } catch {
        // sessionStorage can be blocked (private mode), reloading still works without it
    }
    window.location.assign(path);
    return true;
}
