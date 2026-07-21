// 1. Create the cursor element
const cursor = document.createElement('div');
cursor.id = 'terminal-cursor';
document.body.appendChild(cursor);

let cellW = 14;
let cellH = 28;
let offsetX = 0;
let offsetY = 0;

function enforceBaselineGrid() {
    // A. Measure the exact FixedSys character size
    const tester = document.createElement('span');
    tester.innerText = 'X';
    tester.style.fontFamily = 'FixedSys, monospace';
    tester.style.fontSize = '28px';
    tester.style.lineHeight = '1';
    tester.style.position = 'absolute';
    tester.style.visibility = 'hidden';
    document.body.appendChild(tester);

    const rect = tester.getBoundingClientRect();
    cellW = rect.width;
    cellH = rect.height; // Exact height of the text row (28)
    document.body.removeChild(tester);

    // B. The Secret: Quantize the rogue header
    // This calculates how many pixels the header needs to snap to the next 28px row
    if (figletContainer) {
        figletContainer.style.marginBottom = '0px'; // Reset before measuring
        const figHeight = figletContainer.getBoundingClientRect().height;
        const remainder = figHeight % cellH;

        if (remainder !== 0) {
            const paddingNeeded = cellH - remainder;
            figletContainer.style.marginBottom = `${paddingNeeded}px`;
        }
    }


    /*const leftoverPixels = window.innerWidth % cellW;
    document.body.style.marginRight = `${leftoverPixels}px`;*/

    // 1. Calculate how many pixels we have after reserving exactly 2ch (left + right)
    const availableWidth = window.innerWidth - (cellW * 2);

    // 2. Snap the body width to the nearest whole character column
    const exactBodyWidth = Math.floor(availableWidth / cellW) * cellW;

    // 3. Force the body to that exact width, and use auto-margins to center it
    document.body.style.width = `${exactBodyWidth}px`;
    document.body.style.marginLeft = 'auto';
    document.body.style.marginRight = 'auto';



    // D. NavBar Centering Magic
    const navBar = document.getElementById('nav-bar');
    if (navBar) {
        // Force border-box so padding pushes inward
        navBar.style.boxSizing = 'border-box';

        // 1. Allow the navbar background to stretch edge-to-edge
        navBar.style.width = '100%';
        navBar.style.left = '0';
        navBar.style.right = '0';
        navBar.style.marginLeft = '0';
        navBar.style.marginRight = '0';

        navBar.style.justifyContent = 'flex-start'; // Disable native CSS centering
        navBar.style.paddingLeft = '0px'; // Reset before measuring

        // Measure the exact width of the links
        let contentWidth = 0;
        Array.from(navBar.children).forEach(child => {
            contentWidth += child.getBoundingClientRect().width;
        });

        // 2. Calculate the quantized grid padding (same as your original logic)
        const emptySpace = exactBodyWidth - contentWidth;
        const padCells = Math.floor((emptySpace / 2) / cellW);
        const quantizedPadding = padCells > 0 ? (padCells * cellW) : 0;

        // 3. Calculate the unquantized dead space outside the body
        const bodyMarginLeft = (window.innerWidth - exactBodyWidth) / 2;

        // 4. Combine them so the navbar content lines up perfectly with the body grid
        navBar.style.paddingLeft = `${bodyMarginLeft + quantizedPadding}px`;
    }



    // C. Set standard offsets (Body Margin)
    const bodyStyle = window.getComputedStyle(document.body);
    offsetX = parseFloat(bodyStyle.marginLeft) || 0;
    offsetY = parseFloat(bodyStyle.marginTop) || 0;

    // Apply the strict terminal block size
    cursor.style.width = `${cellW}px`;
    cursor.style.height = `${cellH}px`;
}


// Recalculate if your base.js fetchTitle() script injects new ASCII art
if (figletContainer) {
    // This safely observes only text injection, preventing infinite loops
    const observer = new MutationObserver(enforceBaselineGrid);
    observer.observe(figletContainer, { childList: true });
}

let inactivityTimer;
// This function controls the countdown clock
function resetBlinkTimer() {
    // 1. Immediately stop the blinking because the user is active
    cursor.classList.remove('cursor-blink');

    // 2. Cancel the previous countdown clock
    clearTimeout(inactivityTimer);

    // 3. Start a new 1-second (1000 millisecond) countdown
    inactivityTimer = setTimeout(() => {
        // If this timer finishes without being cancelled, start blinking
        cursor.classList.add('cursor-blink');
    }, 1000);
}

// Detect when the mouse actually leaves the browser window
document.addEventListener('mouseout', (e) => {
    // e.relatedTarget is the element the mouse just entered.
    // If it is null, the mouse left the HTML document entirely.
    if (e.relatedTarget === null) {
        cursor.style.display = 'none';
    }
});

// Detect when the mouse comes back into the window
document.addEventListener('mouseover', () => {
    cursor.style.display = 'block';
});



// Ensure the cursor is fixed to the screen so the new math works perfectly
cursor.style.position = 'fixed';
cursor.style.top = '0';
cursor.style.left = '0';
cursor.style.pointerEvents = 'none';

// Track the raw viewport coordinates of the mouse
let mouseX = 0;
let mouseY = 0;

function updateCursorPosition() {
    // 1. Convert mouse screen position to absolute document position
    const pageX = mouseX + window.scrollX;
    const pageY = mouseY + window.scrollY;

    // 2. Offset by body margins so the grid starts exactly on the text
    const relX = pageX - offsetX;
    const relY = pageY - offsetY;

    // 3. Snap to the exact 28px grid
    const snappedX = Math.floor(relX / cellW) * cellW;
    const snappedY = Math.floor(relY / cellH) * cellH;

    // 4. Add the margins back to get the final absolute document coordinates
    const docX = snappedX + offsetX;
    const docY = snappedY + offsetY;

    // 5. THE FIX: Convert back to screen coordinates for the fixed element
    const screenX = docX - window.scrollX;
    const screenY = docY - window.scrollY;

    cursor.style.transform = `translate(${screenX}px, ${screenY}px)`;
}

// Update tracking variables and redraw when mouse moves
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    updateCursorPosition();
    resetBlinkTimer();
});

// Keep cursor locked perfectly to the text row while scrolling
document.addEventListener('scroll', () => {
    updateCursorPosition();
    resetBlinkTimer();
});



// Hide the terminal cursor when hovering over the custom context menu
const customContextMenuList = customContextMenu.children[0];
if (customContextMenuList) {
    customContextMenuList.addEventListener('mouseenter', () => {
        cursor.style.visibility = 'hidden';
    });

    customContextMenuList.addEventListener('mouseleave', () => {
        // Bring it back when the mouse leaves the menu
        cursor.style.visibility = 'visible';

        // Optional: Instantly snap it to the new position so it doesn't 
        // look like it "jumped" from where it entered the menu
        updateCursorPosition();
    });
}