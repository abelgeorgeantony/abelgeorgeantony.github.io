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
