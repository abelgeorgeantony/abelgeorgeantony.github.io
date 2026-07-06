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


/*function quantizeImages() {
  const images = document.querySelectorAll("img:not(.icon)");

  images.forEach((img) => {
    img.style.width = "";
    img.style.height = "";

    const rect = img.getBoundingClientRect();
    const snappedWidth = Math.ceil(rect.width / cellW) * cellW;
    const snappedHeight = Math.ceil(rect.height / cellH) * cellH;

    img.style.width = `${snappedWidth}px`;
    img.style.height = `${snappedHeight}px`;
    img.style.objectFit = "cover";
    img.style.display = "block";
  });
}*/

/* ==========================================================================
   Responsive Logic via Breakpoints.js
   ========================================================================== */

let currentBreakpoint = 'desktop';

Breakpoints({
    mobile: { min: 0, max: 800 },
    desktop: { min: 801, max: Infinity }
});

function applyResponsiveLayout() {
    const flexContainers = document.querySelectorAll('.hero-section, .second-section, .post-excerpt, .post-footer');
    const navBar = document.getElementById('nav-bar');

    if (currentBreakpoint === 'mobile') {
        flexContainers.forEach(container => {
            container.style.flexDirection = 'column';
        });

        if (navBar) {
            navBar.style.flexDirection = 'row';
            navBar.style.flexWrap = 'wrap';
            navBar.style.height = 'auto';

            const ch = typeof cellH !== 'undefined' ? cellH : 28;
            const snappedNavHeight = Math.ceil(navBar.getBoundingClientRect().height / ch) * ch;

            navBar.style.height = `${snappedNavHeight}px`;
            document.body.style.marginTop = `${snappedNavHeight}px`;
        }
    }
    else if (currentBreakpoint === 'desktop') {
        flexContainers.forEach(container => {
            container.style.flexDirection = 'row';
        });

        if (navBar) {
            navBar.style.flexDirection = 'row';
            navBar.style.flexWrap = 'nowrap';
            navBar.style.height = '2ch';
            document.body.style.marginTop = '2ch';
        }
    }
    // Future: else if (currentBreakpoint === 'tablet') { ... }

    // Re-trigger layout alignment functions
    setTimeout(() => {
        if (typeof quantizeImages === 'function') quantizeImages();
        if (typeof enforceBaselineGrid === 'function') enforceBaselineGrid();
        if (typeof updateHorizontalSeperators === 'function') updateHorizontalSeperators();
    }, 50);
}

Breakpoints.on('mobile', 'enter', () => {
    currentBreakpoint = 'mobile';
    applyResponsiveLayout();
    //document.getElementById("terminal-cursor").style.display = "none";
});

Breakpoints.on('desktop', 'enter', () => {
    currentBreakpoint = 'desktop';
    applyResponsiveLayout();
});

/* ==========================================================================
   Image Quantization (Responsive Override)
   ========================================================================== */

function quantizeImages() {
    const images = document.querySelectorAll("img:not(.icon)");
    const cw = typeof cellW !== 'undefined' ? cellW : 14;
    const ch = typeof cellH !== 'undefined' ? cellH : 28;

    images.forEach((img) => {
        img.style.width = "";
        img.style.height = "";

        if (currentBreakpoint === 'mobile') {
            img.style.maxWidth = "100%";
            img.style.height = "auto";
        } else {
            img.style.maxWidth = "";
        }

        const rect = img.getBoundingClientRect();

        const snappedWidth = Math.max(cw, Math.ceil(rect.width / cw) * cw);
        const snappedHeight = Math.max(ch, Math.ceil(rect.height / ch) * ch);

        img.style.width = `${snappedWidth}px`;
        img.style.height = `${snappedHeight}px`;
        img.style.maxWidth = "none";
        img.style.objectFit = "cover";
        img.style.display = "block";
    });
}