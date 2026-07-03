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

function getFittableCharacterCount(element) {
  const padding = 26;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  context.font = window.getComputedStyle(element).font;

  const charWidth = context.measureText("X").width;
  return Math.round((window.innerWidth - padding) / charWidth);
}

const titleTypes = {
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
  fetchTitle();
  updateHorizontalSeperators();
  enforceBaselineGrid();
  quantizeImages();
});

window.addEventListener("load", () => {
  fetchTitle();
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
