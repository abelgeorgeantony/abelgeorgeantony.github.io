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
function getExactFitSize() {
  const padding = 5; // Safety buffer for scrollbars/margins
  const minSize = 20; // Minimum readable width (prevents requesting name1.txt)

  // 1. Setup Canvas to measure
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  // 2. MUST match your CSS exactly
  context.font = '23.5px "Courier New", monospace';

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
    return toPassToFold + 5;
  }
  return toPassToFold;
}
const titleTypes = {
  name: {
    content: "Abel George Antony",
    length: 18,
  },
};
async function fetchTitle(titleTypeName = "name") {
  const titleType = titleTypes[titleTypeName];
  console.log(titleType);
  const neededSize = getExactFitSize();
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
      "/assets/figlet_titles/" + titleTypeName + "/" + fileName,
    );
    if (!response.ok) throw new Error("File missing");
    const text = await response.text();
    document.getElementById("figlet-container").textContent = text;
  }
}

window.onresize = () => {
  fetchTitle();
};
window.onload = () => {
  console.log("Page loaded");
  fetchTitle();
};
