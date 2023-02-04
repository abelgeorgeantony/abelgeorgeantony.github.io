let year = 0, days = 0, startingday = 0;
let fjs = 0, pfjs = 0;
let numofdayincm = 0, numofdayinpm = 0;
let sidebrpressed = false, sideblpressed = false;
let stoplimit = 0;
let monthnamecount = 0;
let montharr = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
let monthname = montharr[monthnamecount];


function unhidesearch(){
    document.getElementById("yearinbutton").style.visibility = "visible";
}
function hidesearch(){
    document.getElementById("yearinbutton").style.visibility = "hidden";
}

function Yearinput() {
    document.body.style.backgroundImage = "url('monthp1.jpg')";
    tablereset();
    tablevalreset();
    startingday = 0; year = 0; days = 0;
    if (document.getElementById("YearInput").value != "") {
        year = Number(document.getElementById("YearInput").value);
        StartingDayFinder();
        console.log("starting day : " + startingday);
        dayswitcher();
        pfjs = fjs;
        damprinter("startingmonthnochange");
        sidebuttonsendi("enable");
        hidesearch();
    }
    else {
        console.log("null : No year entered");
    }
}
function tablevalreset() {
    year = 0, days = 0, startingday = 0;
    fjs = 0, pfjs = 0;
    numofdayincm = 0, numofdayinpm = 0;
    sidebrpressed = false, sideblpressed = false;
    stoplimit = 0;
    monthnamecount = 0;
    monthname = montharr[monthnamecount];
}

function StartingDayFinder() {
    for (let i = 0; i < year; i++) {
        if (IsLeap(i) == true) {
            days = days + 366;
        }
        else {
            days = days + 365;
        }
    }
    startingday = days % 7;
}

function IsLeap(yearrr) {
    if ((yearrr % 100) == 0) {
        if ((yearrr % 400) == 0) {
            return true;
        }
        else {
            return false;
        }
    }
    else if ((yearrr % 4) == 0) {
        return true;
    }
    return false;
}

function dayswitcher() {
    if (startingday == 0) {
        console.log("saturday");
        fjs = 6;
    }
    else if (startingday == 6) {
        console.log("friday");
        fjs = 5;
    }
    else if (startingday == 5) {
        console.log("thursday");
        fjs = 4;
    }
    else if (startingday == 4) {
        console.log("wednesday");
        fjs = 3;
    }
    else if (startingday == 3) {
        console.log("tuesday");
        fjs = 2;
    }
    else if (startingday == 2) {
        console.log("monday");
        fjs = 1;
    }
    else {
        console.log("sunday");
        fjs = 0;
    }
    console.log("\n");
}

function damprinter(mode) {

    tablereset();

    let i = 0, j = 0, r = 1, cell;

    monthsetting(mode);
    if (sidebrpressed == true) {
        nxtstartingday(numofdayincm);
    }
    else if (sideblpressed == true) {
        prvstartingday(numofdayinpm);
    }


    for (i = 1; i < 7; i++) {
        cell = document.getElementById("monthtable").rows[i].cells;
        for (j = fjs; j < 7; j++) {

            cell[j].innerHTML = r;
            r++;
            if (r == stoplimit) {

                return (null);
            }
        }
        fjs = 0;
    }

}

function tablereset() {
    let i = 0, j = 0, cell;

    for (i = 1; i < 7; i++) {
        cell = document.getElementById("monthtable").rows[i].cells;
        for (j = 0; j < 7; j++) {

            cell[j].innerHTML = null;

        }

    }
}

function nxtstartingday(nodicm) {
    if (nodicm == 28) {
        fjs = pfjs;
    }
    else if (nodicm == 29) {
        if (pfjs < 6) {
            fjs = pfjs + 1;
        }
        else if (pfjs == 6) {
            fjs = 0;
        }
    }
    else if (nodicm == 30) {
        if (pfjs < 5) {
            fjs = pfjs + 2;
        }
        else if (pfjs == 5) {
            fjs = 0;
        }
        else if (pfjs == 6) {
            fjs = 1;
        }
    }
    else if (nodicm == 31) {
        if (pfjs < 4) {
            fjs = pfjs + 3;
        }
        else if (pfjs == 4) {
            fjs = 0;
        }
        else if (pfjs == 5) {
            fjs = 1;
        }
        else if (pfjs == 6) {
            fjs = 2;
        }
    }
    pfjs = fjs;
}
function prvstartingday(nodipm) {
    if (nodipm == 28) {
        fjs = pfjs;
    }
    else if (nodipm == 29) {
        if (pfjs > 0) {
            fjs = pfjs - 1;
        }
        else if (pfjs == 0) {
            fjs = 6;
        }
    }
    else if (nodipm == 30) {
        if (pfjs > 1) {
            fjs = pfjs - 2;
        }
        else if (pfjs == 1) {
            fjs = 6;
        }
        else if (pfjs == 0) {
            fjs = 5;
        }
    }
    else if (nodipm == 31) {
        if (pfjs > 2) {
            fjs = pfjs - 3;
        }
        else if (pfjs == 2) {
            fjs = 6;
        }
        else if (pfjs == 1) {
            fjs = 5;
        }
        else if (pfjs == 0) {
            fjs = 4;
        }
    }
    pfjs = fjs;
}
function nodicmcalc() {
    if (monthnamecount == 1) {
        if (IsLeap(year) == true) {
            numofdayincm = 29;
        }
        else {
            numofdayincm = 28;
        }
    }
    else if (monthnamecount == 3) {
        numofdayincm = 30;
    }
    else if (monthnamecount == 5) {
        numofdayincm = 30;
    }
    else if (monthnamecount == 8) {
        numofdayincm = 30;
    }
    else if (monthnamecount == 10) {
        numofdayincm = 30;
    }
    else {
        numofdayincm = 31;
    }
}
function nodipmcalc() {
    if (monthnamecount == 1) {
        if (IsLeap(year) == true) {
            numofdayinpm = 29;
        }
        else {
            numofdayinpm = 28;
        }
    }
    else if (monthnamecount == 3) {
        numofdayinpm = 30;
    }
    else if (monthnamecount == 5) {
        numofdayinpm = 30;
    }
    else if (monthnamecount == 8) {
        numofdayinpm = 30;
    }
    else if (monthnamecount == 10) {
        numofdayinpm = 30;
    }
    else {
        numofdayinpm = 31;
    }
}

function monthsetting(mode) {
    year = Number(document.getElementById("YearInput").value);
    if (mode == "increment") {
        nodicmcalc();
        monthincr();
    }
    else if (mode == "decrement") {
        monthdecr();
        nodipmcalc();
    }
    else {
        mode = " ";
    }

    monthname = montharr[monthnamecount];

    if(monthnamecount == 0){
        document.body.style.backgroundImage = "url('monthp1.jpg')";
    }
    else if(monthnamecount == 1){
        document.body.style.backgroundImage = "url('monthp2.jpg')";
    }
    else if(monthnamecount == 2){
        document.body.style.backgroundImage = "url('monthp3.jpg')";
    }
    else if(monthnamecount == 3){
        document.body.style.backgroundImage = "url('monthp4.jpg')";
    }
    else if(monthnamecount == 4){
        document.body.style.backgroundImage = "url('monthp5.jpg')";
    }
    else if(monthnamecount == 5){
        document.body.style.backgroundImage = "url('monthp6.jpg')";
    }
    else if(monthnamecount == 6){
        document.body.style.backgroundImage = "url('monthp7.jpg')";
    }
    else if(monthnamecount == 7){
        document.body.style.backgroundImage = "url('monthp8.jpg')";
    }
    else if(monthnamecount == 8){
        document.body.style.backgroundImage = "url('monthp9.jpg')";
    }
    else if(monthnamecount == 9){
        document.body.style.backgroundImage = "url('monthp10.jpg')";
    }
    else if(monthnamecount == 10){
        document.body.style.backgroundImage = "url('monthp11.jpg')";
    }
    else{
        document.body.style.backgroundImage = "url('monthp12.jpg')";
    }

    stoplimitsetter();


    document.getElementById("MonthBox").value = monthname;

}


function stoplimitsetter() {
    if (monthnamecount == 1) {
        if (IsLeap(year) == true) {
            stoplimit = 30;
        }
        else {
            stoplimit = 29;
        }
    }
    else if (monthnamecount == 3) {
        stoplimit = 31;
    }
    else if (monthnamecount == 5) {
        stoplimit = 31;
    }
    else if (monthnamecount == 8) {
        stoplimit = 31;
    }
    else if (monthnamecount == 10) {
        stoplimit = 31;
    }
    else {
        stoplimit = 32;
    }

}
function monthincr() {
    if (monthnamecount < 11) {
        monthnamecount++;
    }
    else if (monthnamecount == 11) {
        monthnamecount = 0;
    }
    else {
        monthnamecount = 0;
    }
}
function monthdecr() {
    if (monthnamecount > 0) {
        monthnamecount--;
    }
    else if (monthnamecount == 0) {
        monthnamecount = 11;
    }
    else {
        monthnamecount = 0;
    }
}

function rightbutton() {
    hidesearch();
    sidebrpressed = true;
    sideblpressed = false;
    if (monthnamecount < 11) {
        damprinter("increment");
    }
    else if(monthnamecount == 11){
        year++;
        document.getElementById("YearInput").value = year;
        damprinter("increment");
    }

}
function leftbutton() {
    hidesearch();
    sideblpressed = true;
    sidebrpressed = false;
    if(monthnamecount > 0){
    damprinter("decrement");
    }
    else if(monthnamecount == 0){
        year--;
        document.getElementById("YearInput").value = year;
        damprinter("decrement");
    }

}
function sidebuttonsendi(mode) {
    if (mode == "enable") {
        document.querySelector('#leftmonthbutton').disabled = false;
        document.querySelector('#rightmonthbutton').disabled = false;
    }
    else if (mode == "disable") {
        document.querySelector('#leftmonthbutton').disabled = true;
        document.querySelector('#rightmonthbutton').disabled = true;
    }
}