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
  if (document.body.dataset.theme === "dark") {
    document.body.dataset.theme = "light";
    toggleThemeButton.innerText = "Dark Mode";
  } else {
    document.body.dataset.theme = "dark";
    toggleThemeButton.innerText = "Light Mode";
  }

  setCookie("theme", document.body.dataset.theme, 30);
}

function toggleCursor() {
  if (document.body.dataset.cursor === "custom") {
    document.body.dataset.cursor = "default";
    toggleCursorButton.innerText = "Custom Cursor";
  } else {
    document.body.dataset.cursor = "custom";
    toggleCursorButton.innerText = "Default Cursor";
  }

  setCookie("cursor", document.body.dataset.cursor, 30);
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
  //fetchTitle();
  renderTitle(figletTitleTypeNeeded);
  updateHorizontalSeperators();
  enforceBaselineGrid();
  quantizeImages();
});

window.addEventListener("load", () => {
  //fetchTitle();
  renderTitle(figletTitleTypeNeeded);
  updateHorizontalSeperators();
  enforceBaselineGrid();
  quantizeImages();
  applyRetroDither("hero-picture");
  applyRetroDither("crazy-picture");

  if (getCookie("theme") === "dark") {
    document.body.dataset.theme = "dark";
    toggleThemeButton.innerText = "Light Mode";
  }

  if (getCookie("cursor") === "default") {
    document.body.dataset.cursor = "default";
    toggleCursorButton.innerText = "Custom Cursor";
  }

  if (instantLoader) {
    instantLoader.classList.add("loader-hidden");

    setTimeout(() => {
      instantLoader.remove();
    }, 400);
  }
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
