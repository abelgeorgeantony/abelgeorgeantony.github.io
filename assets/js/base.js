const customContextMenu = document.getElementById("custom-menu");

// 1. Prevent the default context menu and display the custom one
document.addEventListener("contextmenu", (e) => {
  console.log(e.target)
  if(e.target.tagName === "IMG") {
    return; // Allow default context menu on images
  }
  e.preventDefault(); // Prevents the browser's default menu

  // Position the custom menu at the cursor location
  customContextMenu.style.top = `${e.pageY}px`;
  customContextMenu.style.left = `${e.pageX}px`;
  customContextMenu.classList.remove("hidden");
});
// 2. Hide the custom menu when clicking anywhere else
document.addEventListener("click", (e) => {
  customContextMenu.classList.add("hidden");
});
// 3. Toggle dark mode
document.getElementById("toggleThemeButton").addEventListener("click", (e) => {
  if (document.body.dataset.theme === "dark") {
    document.body.dataset.theme = "light";
    document.getElementById("toggleThemeButton").innerText = "Dark Mode";
  } else {
    document.body.dataset.theme = "dark";
    document.getElementById("toggleThemeButton").innerText = "Light Mode";
  }
});

const textFilesPath = "/assets/figlet_titles/"; // Change to your folder path
const container = document.getElementById("figlet-container");
/**
 * Calculates the exact character width integer
 */
function getFittableCharacterCount(element) {
  const padding = 26; // Safety buffer for scrollbars/margins
  // 1. Setup Canvas to measure
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  // 2. MUST match your CSS exactly
  context.font = window.getComputedStyle(element).font;
  console.log(context.font);
  // 3. Measure one character
  const charWidth = context.measureText("X").width;
  // 4. Calculate raw fit
  return Math.round((window.innerWidth - padding) / charWidth);
}

const titleTypes = {
  name: {
    content: "Abel George Antony",
    length: 18,
  },
};
async function fetchTitle(titleTypeName = "name") {
  const titleType = titleTypes[titleTypeName];
  const rawColumns = getFittableCharacterCount(
    document.getElementById("figlet-container"),
  );
  const minSize = 20; // Minimum readable width (prevents requesting name1.txt)
  if (rawColumns < minSize) {
    return 1;
  }
  let neededSize = Math.round(rawColumns / 7);
  if (neededSize < 6) {
    neededSize = neededSize + 4;
  } else if (neededSize < 8) {
    neededSize = neededSize + 5;
  } else {
    neededSize = neededSize + 6;
  }

  if (Number(neededSize) > Number(titleType.length)) {
    const fileName = Number(titleType.length) + ".txt";
    const response = await fetch(
      "/assets/figlet_titles/" + titleTypeName + "/" + fileName,
    );
    if (!response.ok) throw new Error("File missing");
    const text = await response.text();
    document.getElementById("figlet-container").textContent = text;
  } else {
    const fileName = Number(neededSize) + ".txt";
    const response = await fetch(
      siteBaseUrl + "/assets/figlet_titles/" + titleTypeName + "/" + fileName,
    );
    if (!response.ok) throw new Error("File missing");
    const text = await response.text();
    document.getElementById("figlet-container").textContent = text;
  }
}

function updateHorizontalSeperators() {
  const horizontalSeperators = document.querySelectorAll(
    ".horizontal-seperator",
  );
  horizontalSeperators.forEach((seperator) => {
    const columns = getFittableCharacterCount(seperator);
    let seperatorSymbol = seperator.dataset.separatorsymbol;
    seperatorSymbol = seperatorSymbol.repeat(columns);
    seperator.innerText = seperatorSymbol;
  });
}

window.onresize = () => {
  fetchTitle();
  updateHorizontalSeperators();
};
window.onload = () => {
  console.log("Page loaded");
  fetchTitle();
  updateHorizontalSeperators();
  applyRetroDither("hero-picture");
  applyRetroDither("crazy-picture")
};


function applyRetroDither(imgid) {
    const img = document.getElementById(imgid);
    if (!img) return;

    function processDither() {
        if (typeof bayerDither !== 'function') return;

        // Prevent infinite loops: Changing img.src triggers the 'load' event again.
        // If we've already processed this image, exit immediately.
        if (img.dataset.processed) return;
        
        // Mark as processed and save the original normal image path
        img.dataset.processed = "true";
        img.dataset.originalSrc = img.src; 

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const retroPalette = [[102, 255, 102], [40, 40, 40]]; 

        bayerDither(ctx, imageData, retroPalette, 2);
        
        // Save the generated dithered data and apply it
        img.dataset.ditheredSrc = canvas.toDataURL(); 
        img.src = img.dataset.ditheredSrc; 
        img.dataset.isDithered = "true"; 

        // Listen for clicks to swap between the saved sources
        img.addEventListener('click', () => {
            if (img.dataset.isDithered === "true") {
                img.src = img.dataset.originalSrc;
                img.dataset.isDithered = "false";
            } else {
                img.src = img.dataset.ditheredSrc;
                img.dataset.isDithered = "true";
            }
        });
    }

    if (img.complete) {
        processDither();
    } else {
        img.addEventListener('load', processDither);
    }
}