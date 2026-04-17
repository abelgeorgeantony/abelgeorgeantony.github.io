/**
 * Sets a cookie in the browser
 * @param {string} name - Key of the cookie
 * @param {string} value - Value to store
 * @param {number} days - Days until expiration
 */
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Lax";
}

/**
 * Retrieves a cookie value by its name
 * @param {string} name - Key of the cookie
 * @returns {string|null} Value of the cookie or null if not found
 */
function getCookie(name) {
    let nameEQ = name + "=";
    let cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();

        // If the cookie starts with our target name, return its decoded value
        if (cookie.indexOf(nameEQ) === 0) {
            return decodeURIComponent(cookie.substring(nameEQ.length));
        }
    }

    return null; // Return null if the cookie doesn't exist
}


function openCustomContextMenu() {
    customContextMenu.classList.remove("hidden");
    document.body.classList.add("no-scroll");
}
function closeCustomContextMenu() {
    customContextMenu.classList.add("hidden");
    document.body.classList.remove("no-scroll");
}