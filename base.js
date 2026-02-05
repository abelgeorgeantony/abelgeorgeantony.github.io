const customContextMenu = document.getElementById("custom-menu");

// 1. Prevent the default context menu and display the custom one
document.addEventListener("contextmenu", (e) => {
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
function toggleTheme() {
  if (document.body.dataset.theme === "dark") {
    document.body.dataset.theme = "light";
    customContextMenu;
  } else {
    document.body.dataset.theme = "dark";
  }
}

const textFilesPath = "/assets/titles/"; // Change to your folder path
const container = document.getElementById("figlet-container");
/**
 * Calculates the exact character width integer
 */
function getExactFitSize() {
  const padding = 5; // Safety buffer for scrollbars/margins
  const minSize = 20; // Minimum readable width (prevents requesting name1.txt)

  // 1. Setup Canvas to measure
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  // 2. MUST match your CSS exactly
  context.font = '28px "Courier New", monospace';

  // 3. Measure one character
  const charWidth = context.measureText("X").width;

  // 4. Calculate raw fit
  const rawColumns = Math.floor((window.innerWidth - padding) / charWidth);

  // 5. Return the calculated size, but never go below minSize
  //return Math.max(minSize, rawColumns);
  if (rawColumns < minSize) {
    return 1;
  }

  console.log(rawColumns / 7);
  const toPassToFold = Math.round(rawColumns / 7);
  if (toPassToFold < 7) {
    return toPassToFold + 2;
  } else if (toPassToFold < 9) {
    return toPassToFold + 3;
  } else {
    return toPassToFold + 4;
  }
  return toPassToFold;
}
