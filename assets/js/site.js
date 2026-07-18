const siteBasePath = typeof window.siteBaseUrl === "string" ? window.siteBaseUrl : "";
const customContextMenu = document.getElementById("customContextMenu");
const toggleThemeButton = document.getElementById("toggleThemeButton");
const toggleCursorButton = document.getElementById("toggleCursorButton");
const figletContainer = document.getElementById("figletContainer");
const instantLoader = document.getElementById("instantLoader");

let wasMenuOpen = false;

function siteAssetUrl(path) {
  return `${siteBasePath}${path}`;
}

document.addEventListener("mousedown", (event) => {
  wasMenuOpen = customContextMenu && !customContextMenu.classList.contains("hidden");

  if (event.button === 2 && event.shiftKey) {
    closeCustomContextMenu();
  }
});

document.addEventListener("click", () => {
  closeCustomContextMenu();
});

document.addEventListener("contextmenu", (event) => {
  closeCustomContextMenu();

  if (event.shiftKey) {
    return;
  }

  if (event.target.tagName === "IMG" || event.target.tagName === "A") {
    return;
  }

  if (window.getSelection().toString().trim().length > 0) {
    return;
  }

  event.preventDefault();

  if (wasMenuOpen) {
    closeCustomContextMenu();
    wasMenuOpen = false;
    return;
  }

  if (!customContextMenu) {
    return;
  }

  customContextMenu.style.top = `${event.pageY}px`;
  customContextMenu.style.left = `${event.pageX}px`;
  openCustomContextMenu();
});

function toggleTheme() {
  if (document.documentElement.dataset.theme === "dark") {
    document.documentElement.dataset.theme = "light";
    toggleThemeButton.innerText = "Dark Mode";
  } else {
    document.documentElement.dataset.theme = "dark";
    toggleThemeButton.innerText = "Light Mode";
  }

  setCookie("theme", document.documentElement.dataset.theme, 30);
}

function toggleCursor() {
  const elements = document.querySelectorAll("html, body, a, ul, ol, li");
  if (document.documentElement.dataset.cursor === "custom") {
    elements.forEach((element) => {
      element.classList.remove("hide-cursor");
    });
    document.getElementById("terminal-cursor").classList.add("hidden");
    document.documentElement.dataset.cursor = "default";
    toggleCursorButton.innerText = "Custom Cursor";
  } else {
    elements.forEach((element) => {
      element.classList.add("hide-cursor");
    });
    document.getElementById("terminal-cursor").classList.remove("hidden");
    document.documentElement.dataset.cursor = "custom";
    toggleCursorButton.innerText = "Default Cursor";
  }

  setCookie("cursor", document.documentElement.dataset.cursor, 30);
}


function userAcceptedUnappealness() {
  setCookie("userAcceptedUnappealness", "true", 30);

  // Find the button to use as the starting coordinate for the fire
  const btn = document.querySelector('#instantLoader button');
  // Start the animation and pass the closing function as a callback
  startGreenFireAnimation(btn, closeInstantLoader);
}
/*function getFittableCharacterCount(element) {
  const padding = 26;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  context.font = window.getComputedStyle(element).font;

  const charWidth = context.measureText("X").width;
  return Math.round((window.innerWidth - padding) / charWidth);
}*/
function getFittableCharacterCount(element) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  // Match the font exactly
  context.font = window.getComputedStyle(element).font;
  const charWidth = context.measureText("X").width;

  // 1. Get the parent container
  const parent = element.parentElement;
  const parentStyle = window.getComputedStyle(parent);

  // 2. clientWidth returns the inner width (excluding margins and scrollbars)
  const parentInnerWidth = parent.clientWidth;

  // 3. Subtract any internal padding the parent might have
  const paddingLeft = parseFloat(parentStyle.paddingLeft) || 0;
  const paddingRight = parseFloat(parentStyle.paddingRight) || 0;

  // 4. The absolute true space available for text
  const availableWidth = parentInnerWidth - paddingLeft - paddingRight;

  // Use Math.floor instead of Math.round to guarantee we never accidentally
  // round up into an overflow state and trigger a line wrap.
  return Math.floor(availableWidth / charWidth);
}



/*const titleTypes = {
  name: {
    content: "Abel George Antony",
    length: 18,
  },
};

async function fetchTitle(titleTypeName = "name") {
  if (!figletContainer) {
    return;
  }

  const titleType = titleTypes[titleTypeName];
  const rawColumns = getFittableCharacterCount(figletContainer);
  const minSize = 20;

  if (rawColumns < minSize) {
    return;
  }

  let neededSize = Math.round(rawColumns / 7);

  if (neededSize < 6) {
    neededSize += 4;
  } else if (neededSize < 8) {
    neededSize += 5;
  } else {
    neededSize += 6;
  }

  const fileNumber = Math.min(Number(neededSize), Number(titleType.length));
  const fileName = `${fileNumber}.txt`;
  const response = await fetch(
    siteAssetUrl(`/assets/figlet_titles/${titleTypeName}/${fileName}`),
  );

  if (!response.ok) {
    throw new Error("File missing");
  }

  figletContainer.textContent = await response.text();
}*/
/* ==========================================================================
   FIGlet Title Logic (Exact Width Measurement & Centering)
   ========================================================================== */

const titleTypes = {
  fournoughtfour: {
    content: "/404",
    length: 4,
    urlpaths: ["/404", "/404/"],
    isLoaded: false,
    cache: {}
  },
  name: {
    content: "Abel George Antony",
    length: 18,
    isLoaded: false,
    cache: {}
  },
  posts: {
    content: "Posts",
    length: 5,
    isLoaded: false,
    cache: {}
  },
  gallery: {
    content: "Gallery",
    length: 7,
    isLoaded: false,
    cache: {}
  },
  youtube: {
    content: "Youtube",
    length: 7,
    isLoaded: false,
    cache: {}
  }
};

// Measure the true width of the ASCII art (longest line)
function getAsciiWidth(asciiStr) {
  const lines = asciiStr.split('\n');
  let max = 0;
  for (const line of lines) {
    if (line.length > max) max = line.length;
  }
  return max;
}

// Pre-load all tiny text files instantly in the background
async function loadAllTitles(titleTypeName = "name") {
  const titleInfo = titleTypes[titleTypeName];
  if (titleInfo.isLoaded) return;

  const fetchPromises = [];
  for (let i = 1; i <= titleInfo.length; i++) {
    fetchPromises.push(
      fetch(siteAssetUrl(`/assets/figlet_titles/${titleTypeName}/${i}.txt`))
        .then(res => res.ok ? res.text() : "")
        .then(text => { titleInfo.cache[i] = text; })
        .catch(() => { titleInfo.cache[i] = ""; })
    );
  }

  await Promise.all(fetchPromises);
  titleInfo.isLoaded = true;
}

// Find the perfect fit and center it with exact space characters
async function renderTitle(titleTypeNeeded = "name") {
  if (!figletContainer) return;

  /*const titleTypeName = Object.keys(titleTypes).find(key =>
    titleTypes[key].urlpaths.includes(urlPathname)
  ) || "name";*/
  const titleInfo = titleTypes[titleTypeNeeded];
  figletContainer.innerText = titleInfo.content;
  if (!titleInfo.isLoaded) {
    await loadAllTitles(titleTypeNeeded);
  }

  const rawColumns = getFittableCharacterCount(figletContainer);

  // Find the largest file that physically fits in the columns
  let bestText = titleInfo.cache[1] || "";
  for (let i = 1; i <= titleInfo.length; i++) {
    const art = titleInfo.cache[i];
    if (art && getAsciiWidth(art) <= rawColumns) {
      bestText = art;
    }
  }

  // Calculate dead space and pad left to center perfectly
  const artWidth = getAsciiWidth(bestText);
  const paddingLeft = Math.max(0, Math.floor((rawColumns - artWidth) / 2));
  const spaces = " ".repeat(paddingLeft);

  const centeredArt = bestText.split('\n').map(line => spaces + line).join('\n');

  figletContainer.textContent = centeredArt;
}





function updateHorizontalSeperators() {
  const horizontalSeperators = document.querySelectorAll(".horizontal-seperator");

  horizontalSeperators.forEach((seperator) => {
    const columns = getFittableCharacterCount(seperator);
    const seperatorSymbol = seperator.dataset.separatorsymbol;

    seperator.innerText = seperatorSymbol.repeat(columns);
  });
}

window.addEventListener("resize", () => {
  renderTitle(figletTitleTypeNeeded);
  updateHorizontalSeperators();
  enforceBaselineGrid();
  quantizeImages();
});

window.addEventListener("load", () => {
  if (getCookie("theme") === "dark") {
    document.documentElement.dataset.theme = "dark";
    toggleThemeButton.innerText = "Light Mode";
  }
  if (getCookie("cursor") === "default") {
    document.documentElement.dataset.cursor = "custom";
    toggleCursor();
  }
  else {
    document.documentElement.dataset.cursor = "default";
    toggleCursor();
  }

  renderTitle(figletTitleTypeNeeded);
  updateHorizontalSeperators();
  enforceBaselineGrid();
  quantizeImages();
  applyRetroDither("hero-picture");
  applyRetroDither("crazy-picture");

  if (getCookie("userAcceptedUnappealness") === "true") {
    const btn = document.querySelector('#instantLoader button');
    // Start the animation and pass the closing function as a callback
    startGreenFireAnimation(btn, closeInstantLoader);
  }
  else {
    const btn = document.querySelector('#instantLoader button');
    btn.classList.remove("hidden");
  }
  instantLoader.children[0].classList.add("hidden");
});

function applyRetroDither(imgid) {
  const img = document.getElementById(imgid);

  if (!img) {
    return;
  }

  function processDither() {
    if (typeof bayerDither !== "function" || img.dataset.processed) {
      return;
    }

    img.dataset.processed = "true";
    img.dataset.originalSrc = img.src;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const retroPalette = [
      [102, 255, 102],
      [40, 40, 40],
    ];

    bayerDither(ctx, imageData, retroPalette, 1);

    img.dataset.ditheredSrc = canvas.toDataURL();
    img.src = img.dataset.ditheredSrc;
    img.dataset.isDithered = "true";

    if (!img.classList.contains("web-badge")) {
      img.addEventListener("click", () => {
        if (img.dataset.isDithered === "true") {
          img.src = img.dataset.originalSrc;
          img.dataset.isDithered = "false";
        } else {
          img.src = img.dataset.ditheredSrc;
          img.dataset.isDithered = "true";
        }
      });
    }
  }

  if (img.complete) {
    processDither();
  } else {
    img.addEventListener("load", processDither);
  }
}



function startGreenFireAnimation(triggerElement, onComplete) {
  if (!instantLoader) return onComplete();

  // 1. Create and overlay the canvas on the loader
  const canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.zIndex = "999999";
  canvas.style.pointerEvents = "none";
  instantLoader.appendChild(canvas);
  instantLoader.style.cursor = "none !important";

  const ctx = canvas.getContext("2d");
  const rect = instantLoader.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  // 2. Setup the Cellular Automata Grid
  const cellSize = 14; // Matches the character block width from your responsive logic
  const cols = Math.ceil(canvas.width / cellSize);
  const rows = Math.ceil(canvas.height / cellSize);

  let grid = Array.from({ length: cols }, () => new Array(rows).fill(0));
  let nextGrid = Array.from({ length: cols }, () => new Array(rows).fill(0));

  /*// 3. Ignite at the button's location (or screen center as fallback)
  let startX = Math.floor(cols / 2);
  let startY = Math.floor(rows / 2);

  if (triggerElement) {
    const btnRect = triggerElement.getBoundingClientRect();
    startX = Math.floor((btnRect.left + btnRect.width / 2) / cellSize);
    startY = Math.floor((btnRect.top + btnRect.height / 2) / cellSize);
  }

  // Bound checks
  startX = Math.max(0, Math.min(cols - 1, startX));
  startY = Math.max(0, Math.min(rows - 1, startY));

  // Set initial "burning" cell
  grid[startX][startY] = 1;
  ctx.fillStyle = "#66ff66";
  ctx.fillRect(startX * cellSize, startY * cellSize, cellSize, cellSize);
  */


  // 3. Ignite at the button's location OR all four corners
  ctx.fillStyle = getCssVariable("--background");

  if (!triggerElement.classList.contains("hidden")) {
    // If the button exists, start from its center coordinates
    const btnRect = triggerElement.getBoundingClientRect();
    let startX = Math.floor((btnRect.left + btnRect.width / 2) / cellSize);
    let startY = Math.floor((btnRect.top + btnRect.height / 2) / cellSize);

    // Bound checks
    startX = Math.max(0, Math.min(cols - 1, startX));
    startY = Math.max(0, Math.min(rows - 1, startY));

    grid[startX][startY] = 1;
    ctx.fillRect(startX * cellSize, startY * cellSize, cellSize, cellSize);
  } else {
    // If no button is passed, ignite the four corners
    const corners = [
      { x: 0, y: 0 },                                // Top-Left
      { x: cols - 1, y: 0 },                         // Top-Right
      { x: 0, y: rows - 1 },                         // Bottom-Left
      { x: cols - 1, y: rows - 1 }                   // Bottom-Right
    ];

    for (let i = 0; i < corners.length; i++) {
      let cx = corners[i].x;
      let cy = corners[i].y;
      grid[cx][cy] = 1;
      ctx.fillRect(cx * cellSize, cy * cellSize, cellSize, cellSize);
    }
  }

  let isAnimating = true;

  // 4. Spread loop algorithm
  function update() {
    let changed = false;
    let emptyCount = 0;

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        nextGrid[x][y] = grid[x][y]; // Inherit previous state

        if (grid[x][y] === 0) {
          emptyCount++;

          // Check orthogonal neighbors
          let neighbors = 0;
          if (x > 0 && grid[x - 1][y] === 1) neighbors++;
          if (x < cols - 1 && grid[x + 1][y] === 1) neighbors++;
          if (y > 0 && grid[x][y - 1] === 1) neighbors++;
          if (y < rows - 1 && grid[x][y + 1] === 1) neighbors++;

          // 65% chance to spread if a neighbor is burning
          if (neighbors > 0 && Math.random() < 0.65) {
            nextGrid[x][y] = 1;
            changed = true;
            emptyCount--;

            // Draw newly converted cell
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        }
      }
    }

    // Fast O(1) buffer swap
    let temp = grid;
    grid = nextGrid;
    nextGrid = temp;

    // 5. Completion Logic
    if (emptyCount === 0 || !changed) {
      if (emptyCount > 0) {
        // Failsafe: if the random spread stalls out, instantly fill the remaining gaps
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      isAnimating = false;

      // Pause briefly for impact, then fire your existing close function
      setTimeout(() => {
        onComplete();
      }, 200);
    }

    if (isAnimating) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}