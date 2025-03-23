function fieldsFilled() {
    if (document.getElementById("message").value != "") {
        if (document.getElementById("messagesender").value != "") {
            return true;
        }
        return false;
    }
    return false;
}

function sendForm() {
    if (fieldsFilled()) {
        console.log("goodly filled");
    }
    else {
        document.getElementById("errordiv").innerHTML = "**First fill all the fields";
    }
}

function sendRequest() {

}