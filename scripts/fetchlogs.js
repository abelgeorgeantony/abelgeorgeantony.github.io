function getlatestlog(){
    let latestlogxhr = new XMLHttpRequest();
    latestlogxhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           //document.getElementById("livedevlogidd").setAttribute("src", latestlogxhr.responseText);
           console.log(latestlogxhr.responseText);
           document.getElementById("livedevlogidd").src = "../scripts/" + latestlogxhr.responseText;
        }
    };
    latestlogxhr.open("GET", "../scripts/fetchlatestlog.php", true);
    latestlogxhr.send();
    
}