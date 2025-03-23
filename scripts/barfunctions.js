
window.onscroll = function () { windowsticky(); };

const navbar = document.getElementById("horizontalbar");
const sticky = navbar.offsetTop;

function windowsticky() {
  if (window.scrollY >= sticky) {
    navbar.classList.add("sticky");
  } else {
    navbar.classList.remove("sticky");
  }
}

function openthreedotspopup() {
  if (document.getElementById("sideverticalbar").style.visibility == "hidden") {
    document.getElementById("sideverticalbar").style.visibility = "visible";
    document.getElementById("body").classList.add("removescroll");
  }
}

function closethreedotspopup() {
  if (document.getElementById("sideverticalbar").style.visibility == "visible") {
    document.getElementById("sideverticalbar").style.visibility = "hidden";
    document.getElementById("body").classList.remove("removescroll");
  }
}

function removemainscroll() {
  if (document.getElementById("sideverticalbar").style.visibility == "visible") {
    document.getElementById("body").classList.add("removescroll");
  }
}
function addmainscroll() {
  if (document.getElementById("sideverticalbar").style.visibility == "visible") {
    document.getElementById("body").classList.remove("removescroll");
  }
}