function onloadhidings(pagename) {
    document.getElementById("sideverticalbar").style.visibility = "hidden";
    if(pagename === "index") {
        hideAllWPContent();
    }
}

function loadpage(page) {
    onloadhidings(page);
    setTimeout(function () { document.getElementById("loadingcover").style.visibility = "hidden" }, 500);
    //document.getElementById("loadingcover").style.visibility = "hidden";
}


function hideAllWPContent() {
    document.getElementById("topofwp").classList.remove("topofwpheight");
    let collection, i = 0;
    collection = document.getElementsByClassName("wpcontent");
    for (i = 0; i < collection.length; i++) {
        collection[i].classList.add("makeitsmall");
    }
}
let wpopen = 0;
function expandWPContent(OpenWaypoint) {
    hideAllWPContent();
    if (wpopen === OpenWaypoint) {
        hideWPContent(OpenWaypoint);
        wpopen = 0;
    }
    else {
        document.getElementById("topofwp").classList.add("topofwpheight");
        document.getElementById("wpcontent" + OpenWaypoint).classList.remove("makeitsmall");
        wpopen = OpenWaypoint;
        window.location.href = "#topofwp";
    }
}
function hideWPContent(CloseWaypoint) {
    document.getElementById("wpcontent" + CloseWaypoint).classList.add("makeitsmall");
}

