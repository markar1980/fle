function allowReturn(radio) {
  if (radio.value == "2") {
    returnDateVariable.disabled = true;
  } else {
    returnDateVariable.disabled = false;
  }
}

function blockFligthSelect(removeWhat, removeFrom) {
  let len = removeFrom.options.length;
  for (let i = 0; i < len; i++) {
    if (removeWhat.value != "" && removeFrom.options[i].value == removeWhat.value) {
      removeFrom.options[i].disabled = true;
      if (removeFrom.options[i].selected) {
        removeFrom.selectedIndex = "0";
      }
    } else {
      removeFrom.options[i].disabled = false;
    }
  }
  flightToVariable.disabled = false;
}

const todayISO = new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000).toISOString().split("T")[0];
const tomorrow = new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000);
const year = new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000);
tomorrow.setDate(tomorrow.getDate() + 1);
year.setDate(year.getDate() + 365);
const tomorrowISO = tomorrow.toISOString().split("T")[0];
const yearISO = year.toISOString().split("T")[0];
leavingDateVariable.min = todayISO;
leavingDateVariable.max = yearISO;
returnDateVariable.min = tomorrowISO;
returnDateVariable.max = yearISO;
leavingDateVariable.addEventListener('change', setMinReturn);

function setMinReturn() {
  var leavingDate = leavingDateVariable.valueAsDate;
  if (leavingDate != null) {
    var returnDate = new Date(leavingDate);
    returnDate.setDate(leavingDate.getDate() + 1);
    returnDateVariable.min = returnDate.toISOString().split("T")[0];
    if (leavingDateVariable.valueAsDate != null && returnDateVariable.valueAsDate != null) {
      checkFlightDate() ? true : alert('Data powrotu nie może być wcześniejasz lub równa dacie lotu docelowego');
    }
  } else {
    returnDateVariable.min = tomorrowISO;
  }
}

function checkFlightDate() {
  var returnDate = returnDateVariable;
  return ((returnDate.valueAsDate.toISOString().split("T")[0] < returnDate.min) ? false : true);
}

leavingDateVariable.addEventListener('blur', changeDateOne);

function changeDateOne() {
  let leavingDatePrime = leavingDateVariable.value;
  if (leavingDatePrime < todayISO) {
    window.alert("Najwcześniejsza możliwa data wylotu to: " + todayISO);
    leavingDateVariable.value = todayISO;
  }
}

returnDateVariable.addEventListener('blur', changeDateTwo);

function changeDateTwo() {
  let returnDatePrime = returnDateVariable.value;
  if (returnDatePrime < tomorrowISO) {
    window.alert("Najwcześniejsza możliwa data powrotu to: " + tomorrowISO);
    returnDateVariable.value = tomorrowISO;
  }
}

document.getElementById("search-button").onclick = allowSearch;

function allowSearch() {
  if (
    (returnDateVariable.disabled == true) &&
    (flightFromVariable.value != "") &&
    (flightToVariable.value != "") &&
    (leavingDateVariable.value != "")
  ) {
    if (flightFromVariable.value == flightToVariable.value) {
      window.alert("Miejsce wylotu i docelowe nie mogą być tożsame")
    }
    else
      loadFlightData();
  }
  else if (
    (returnDateVariable.disabled == false) &&
    (flightFromVariable.value != "") &&
    (flightToVariable.value != "") &&
    (leavingDateVariable.value != "") &&
    (returnDateVariable.value != "") &&
    checkFlightDate()
  ) {
    if (flightFromVariable.value == flightToVariable.value) {
      window.alert("Miejsce wylotu i docelowe nie mogą być tożsame");
    }
    else
      loadFlightData();
  }
  else { window.alert("Proszę wypełnić prawidłowo wszystkie wymagane pola wyszukiwania"); }
}

function loadFlightData() {
  const url = "https://raw.githubusercontent.com/markar1980/fle/master/JSON/dataJSON.json";
  fetch(url)
    .then(response => response.json())
    .then(data => searchFlight(data.jsonFlights))
    .catch(err => console.error(err));
}

function searchFlight(jsonFlights) {
  const returnFlight = returnVariable.checked;
  if (returnFlight == true) {
    searchWinVar.style.display = "none";
    searchRstWrapVar.style.display = "inline-block";
    returnRstWrapVar.style.display = "inline-block";
  }
  else {
    searchWinVar.style.display = "none";
    searchRstWrapVar.style.display = "inline-block";
    returnRstWrapVar.style.display = "none";
  }
  const flightFrom = flightFromVariable.value;
  const flightTo = flightToVariable.value;
  var leavingDate = leavingDateVariable.value;
  var returnDate = returnDateVariable.value;
  const numberPassengers = numbPassVar.value;
  for (let i = 0; i < jsonFlights.length; i++) {
    if (
      (flightFrom == jsonFlights[i].start) &&
      (flightTo == jsonFlights[i].end)
    ) {
      searchResult = {
        from: flightFrom,
        to: flightTo,
        day: leavingDate,
        time: jsonFlights[i].time,
        start: jsonFlights[i].startTime,
        end: jsonFlights[i].endTime,
        passengers: numberPassengers,
        price: jsonFlights[i].basicPrice,
        bag1: jsonFlights[i].cabinPrice,
        bag2: jsonFlights[i].registerPrice,
        plane: jsonFlights[i].plane
      }
    }
  }

  document.getElementById("flight-to-starting-place-id").innerText = searchResult.from;
  document.getElementById("flight-to-destination-id").innerText = searchResult.to;
  document.getElementById("flight-to-day-date-id").innerText = searchResult.day;
  document.getElementById("flight-to-time-id").innerText = searchResult.time;
  document.getElementById("flight-to-starting-time-id").innerText = searchResult.start;
  document.getElementById("flight-to-end-time-id").innerText = searchResult.end;
  document.getElementById("flight-to-pass-no-id").innerText = searchResult.passengers;
  document.getElementById("flight-to-price-id").innerText = searchResult.price;
  document.getElementById("flight-to-bag1-id").innerText = searchResult.bag1;
  document.getElementById("flight-to-bag2-id").innerText = searchResult.bag2;

  if (returnFlight == true) {
    returnResult = {};
    for (let j = 0; j < jsonFlights.length; j++) {
      if (
        (flightTo == jsonFlights[j].start) &&
        (flightFrom == jsonFlights[j].end)
      ) {
        returnResult = {
          from: flightTo,
          to: flightFrom,
          time: jsonFlights[j].time,
          day: returnDate,
          start: jsonFlights[j].startTime,
          end: jsonFlights[j].endTime,
          passengers: numberPassengers,
          price: jsonFlights[j].basicPrice,
          bag1: jsonFlights[j].cabinPrice,
          bag2: jsonFlights[j].registerPrice,
          plane: jsonFlights[j].plane
        }

        document.getElementById("return-flight-starting-place-id").innerText = returnResult.from;
        document.getElementById("return-flight-destination-id").innerText = returnResult.to;
        document.getElementById("return-flight-day-date-id").innerText = returnResult.day;
        document.getElementById("return-flight-time-id").innerText = returnResult.time;
        document.getElementById("return-flight-starting-time-id").innerText = returnResult.start;
        document.getElementById("return-flight-end-time-id").innerText = returnResult.end;
        document.getElementById("return-flight-pass-no-id").innerText = returnResult.passengers;
        document.getElementById("return-flight-price-id").innerText = returnResult.price;
        document.getElementById("return-flight-bag1-id").innerText = returnResult.bag1;
        document.getElementById("return-flight-bag2-id").innerText = returnResult.bag2;
      }
    }
  }
  sumValueArray.push(searchResult.from, searchResult.to, searchResult.passengers, returnFlight ? "tak" : "nie", searchResult.day, searchResult.start, searchResult.end,
    returnFlight ? returnResult.day : "", returnFlight ? returnResult.start : "", returnFlight ? returnResult.end : "", searchResult.time, searchResult.plane, (searchResult.price + ",00 zł"), returnFlight ? (searchResult.price * 2 * searchResult.passengers + ",00 zł") : (searchResult.price * searchResult.passengers + ",00 zł"), "", 0, (0 + ",00 zł"), 0, (0 + ",00 zł"), returnFlight ? (searchResult.price * 2 * searchResult.passengers + ",00 zł") : (searchResult.price * searchResult.passengers + ",00 zł"))
  displaySum();
}

function displaySum() {
  for (let p = 0; p < sumValueArray.length; p++) {
    document.getElementById("sum" + (p + 1)).innerHTML = sumValueArray[p];
  }
}

function clearSum() {
  sumValueArray = [];
  for (let i = 1; i <= 20; i++) {
    document.getElementById("sum" + i).innerHTML = "";
  }
}

document.getElementById("return-to-search-id").addEventListener("click", returnToSearch);

function returnToSearch() {
  searchResult = {};
  returnResult = {};
  optionArray = [];
  searchWinVar.style.display = "block";
  searchRstWrapVar.style.display = "none";
  logWinVar.style.display = "none";
  smAirbusVar.style.display = "none";
  smAtrVar.style.display = "none";
  optionsVar.style.display = "none";
  finalSumVar.style.display = "none";
  finishVar.style.display = "none";
  resetSeats();
  clearSum();
  removeChildren(passOptVar);
  removeChildren(finalSumPassVar);
}

document.getElementById("go-to-login-id").addEventListener("click", goToLogin);

function goToLogin() {
  searchRstWrapVar.style.display = "none";
  if (loggedIn == false) {
    logWinVar.style.display = "block";
  }
  else {
    openSeatMap();
  }
};

document.getElementById("log-button-id").onclick = loadUsersData;

function loadUsersData() {
  const url = "https://raw.githubusercontent.com/markar1980/fle/master/JSON/dataJSON.json";
  fetch(url)
    .then(response => response.json())
    .then(data => logIn(data.jsonLogin))
    .catch(err => console.error(err));
}

function logIn(jsonLogin) {
  for (let i = 0; i < jsonLogin.length; i++) {
    if ((jsonLogin[i].user == usernameVar.value) &&
      (jsonLogin[i].pass == document.getElementById("password-id").value)) {
      loginObject = {
        user: usernameVar.value,
        password: "",
        name: jsonLogin[i].name,
        surname: jsonLogin[i].surname,
        email: jsonLogin[i].email
      };
      loggedIn = true;
      logWinVar.style.display = "none";
      logoutButtonVar.style.display = "block";
      openSeatMap();
      setupTimers();
    } else {
      window.alert("Proszę wprowadzić prawidłowe dane logowania");
    }
  }
}

function logOut(isIdle) {
  clearInterval(intervalLog);
  timerVar.innerHTML = "nie jesteś zalogowany";
  returnToSearch();
  loggedIn = false;
  loginObject = {};
  logoutButtonVar.style.display = "none";
  if (isIdle) {
    window.alert("Zostałeś wylogowany z powodu bezczynności");
  }
}

function startTimer() {
  timeout = 3 * 60000;
  intervalLog = setInterval(logoutTimer, 1000);
}

function logoutTimer() {
  var minutes = Math.floor((timeout % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((timeout % (1000 * 60)) / 1000);
  minutes = checkTime(minutes);
  seconds = checkTime(seconds);
  timerVar.innerHTML = minutes + ":" + seconds;
  (timeout < 0) ? logOut(true) : timeout -= 1000;
}

function resetTimer() {
  if (loggedIn) {
    clearInterval(intervalLog);
    startTimer();
  }
}

function setupTimers() {
  document.addEventListener("mousedown", resetTimer, false);
  startTimer();
}

function checkTime(i) {
  return (i < 10 ? i = "0" + i : i);
}

function logOutButton() {
  const acpt = confirm("Czy na pewno chcesz się wylogować?");
  if (acpt == true) {
    logOut(false);
  }
}

document.getElementById("returng-to-search-id-log").onclick = returnToResults;

function returnToResults() {
  searchRstWrapVar.style.display = "block";
  logWinVar.style.display = "none";
}

document.getElementById("return-to-start-1-id").onclick = returnToSearch;

function openSeatMap() {
  if (searchResult.plane == "ATR 42-600") {
    smAtrVar.style.display = "block"
  }
  else {
    smAirbusVar.style.display = "block"
  }
}

const seatArray = document.getElementsByClassName("module__seat");

for (let i = 0; i < seatArray.length; i++) {
  seatArray[i].addEventListener("click", chooseSeat);
}

var seats = [];
var seatsDisplay = [];
var seatsSorted = [];

function chooseSeat() {
  if (seats.length < numbPassVar.value) {
    var chooseSeatId = this.id;
    if (seats.indexOf(chooseSeatId) == -1) {
      var seatIdFragment = chooseSeatId.slice(2)
      seats.push(chooseSeatId);
      seatsDisplay.push(seatIdFragment);
      seatsSorted = seatsDisplay.sort();
      document.getElementById("sum15").innerHTML = seatsSorted;
      changeColor();
    }
  }
  else { window.alert("Wybrałeś już maksymalną ilość miejsc") }
}

function changeColor() {
  for (let i = 0; i < seats.length; i++) {
    let changeColorId = document.getElementById(seats[i]);
    changeColorId.style.fill = "green";
  }
}

function resetSeats() {
  for (let i = 0; i < seats.length; i++) {
    let changeColorId = document.getElementById(seats[i]);
    changeColorId.style.fill = "rgba(0,0,0,0.5)";
  }
  seats = [];
  seatsDisplay = [];
  document.getElementById("sum15").innerHTML = "";
}

document.getElementById("return-to-search-id-s").onclick = returnToResults2;

function returnToResults2() {
  searchRstWrapVar.style.display = "block";
  smAtrVar.style.display = "none";
  resetSeats();
}

document.getElementById("return-to-search-id-m").onclick = returnToResults3;

function returnToResults3() {
  searchRstWrapVar.style.display = "block";
  smAirbusVar.style.display = "none";
  smAtrVar.style.display = "none";
  resetSeats()
}

document.getElementById("return-to-start-2-id").onclick = returnToSearch;
document.getElementById("return-to-start-3-id").onclick = returnToSearch;

function openOptions() {
  if (seats.length == searchResult.passengers) {
    smAtrVar.style.display = "none";
    smAirbusVar.style.display = "none";
    optionsVar.style.display = "block";
    createPassengersDisplay(seats.length);
  }
  else (window.alert("Proszę wybrać komplet miejsc"));
}

function createPassengersDisplay(passNum) {
  let fragment = new DocumentFragment();
  let passOptionsId = passOptVar;

  for (let i = 1; i <= seats.length; i++) {
    let container = document.createElement('div');
    container.setAttribute('class', 'passenger-div-' + i);
    container.setAttribute('id', 'passenger-div-' + i + '-id');

    let header1 = document.createElement("h3");
    header1.setAttribute('class', 'passenger-' + i);
    header1.setAttribute('id', 'passenger-' + i + '-id');
    header1.setAttribute('style', 'font-weight: bold');
    header1.innerHTML = "Pasażer " + i;

    let label1 = document.createElement("label");
    label1.setAttribute('for', 'passenger-' + i + '-name-id');
    label1.innerHTML = "Podaj imię";

    let input1 = document.createElement("input");
    input1.setAttribute('type', 'text');
    input1.setAttribute('id', 'passenger-' + i + '-name-id');

    let label2 = document.createElement("label");
    label2.setAttribute('for', 'passenger-' + i + '-surname-id');
    label2.innerHTML = "Podaj Nazwisko";

    let input2 = document.createElement("input");
    input2.setAttribute('type', 'text');
    input2.setAttribute('id', 'passenger-' + i + '-surname-id');

    let header2 = document.createElement("h4");
    header2.setAttribute('style', 'font-weight: bold');
    header2.innerHTML = "Opcje dodatkowe";

    let label3 = document.createElement("label");
    label3.setAttribute('for', 'passenger-' + i + '-cabinbag-id');
    label3.innerHTML = "Dodatkowa torba kabinowa 55x40x20 cm ";

    let input3 = document.createElement("input");
    input3.setAttribute('type', 'checkbox');
    input3.setAttribute('id', 'passenger-' + i + '-cabinbag-id');

    let label4 = document.createElement("label");
    label4.setAttribute('for', 'passenger-' + i + '-register-id');
    label4.innerHTML = "Bagaż rejestrowany 20 kg ";

    let input4 = document.createElement("input");
    input4.setAttribute('type', 'checkbox');
    input4.setAttribute('id', 'passenger-' + i + '-register-id');

    container.appendChild(header1);
    container.appendChild(label1);
    container.appendChild(input1);
    container.appendChild(document.createElement("br"));
    container.appendChild(label2);
    container.appendChild(input2);
    container.appendChild(document.createElement("br"));
    container.appendChild(document.createElement("br"));
    container.appendChild(header2);
    container.appendChild(label3);
    container.appendChild(input3);
    input3.onclick = (event) => cabinbagChange(event.target);
    container.appendChild(document.createElement("br"));
    container.appendChild(label4);
    container.appendChild(input4);
    input4.onclick = (event) => registerChange(event.target);
    container.appendChild(document.createElement("hr"));
    fragment.appendChild(container);
  }
  passOptionsId.appendChild(fragment);
}

function removeChildren(parentNode) {
  while (parentNode.firstChild) {
    parentNode.removeChild(parentNode.firstChild);
  }
}

function cabinbagChange(checkbox) {
  var cabinbagNumSpan = document.getElementById('sum16').innerHTML;
  var cabinbagNum = isNaN(parseInt(cabinbagNumSpan)) ? 0 : parseInt(cabinbagNumSpan);
  checkbox.checked ? cabinbagNum++ : cabinbagNum--;
  if (returnVariable.checked) {
    document.getElementById('sum16').innerHTML = cabinbagNum;
    document.getElementById('sum17').innerHTML = 2 * cabinbagNum * searchResult.bag1 + ",00 zł";
    document.getElementById("sum20").innerHTML = (searchResult.price * 2 * searchResult.passengers + 2 * cabinbagNum * searchResult.bag1 + 2 * parseInt(document.getElementById('sum19').innerHTML) + ",00 zł");
  } else {
    document.getElementById('sum16').innerHTML = cabinbagNum;
    document.getElementById('sum17').innerHTML = cabinbagNum * searchResult.bag1 + ",00 zł";
    document.getElementById("sum20").innerHTML = (searchResult.price * searchResult.passengers + cabinbagNum * searchResult.bag1 + parseInt(document.getElementById('sum19').innerHTML) + ",00 zł");
  }
}

function registerChange(checkbox) {
  var registerNumSpan = document.getElementById('sum18').innerHTML;
  var registerNum = isNaN(parseInt(registerNumSpan)) ? 0 : parseInt(registerNumSpan);

  checkbox.checked ? registerNum++ : registerNum--;
  if (returnVariable.checked) {
    document.getElementById('sum18').innerHTML = registerNum;
    document.getElementById('sum19').innerHTML = 2 * registerNum * searchResult.bag2 + ",00 zł";
    document.getElementById("sum20").innerHTML = (searchResult.price * 2 * searchResult.passengers + 2 * parseInt(document.getElementById('sum17').innerHTML) + 2 * registerNum * searchResult.bag2 + ",00 zł");
  } else {
    document.getElementById('sum18').innerHTML = registerNum;
    document.getElementById('sum19').innerHTML = registerNum * searchResult.bag2 + ",00 zł";
    document.getElementById("sum20").innerHTML = (searchResult.price * searchResult.passengers + parseInt(document.getElementById('sum17').innerHTML) + registerNum * searchResult.bag2 + ",00 zł");
  }
}

function validatePassengersData(passNum) {
  var msg = "";
  for (let i = 1; i <= passNum; i++) {
    var name = document.getElementById('passenger-' + i + '-name-id').value;
    var surname = document.getElementById('passenger-' + i + '-surname-id').value;
    if (name == "") {
      msg = msg + ("Proszę podać imię pasażera nr: " + i + "\n")
    }
    if (surname == "") {
      msg = msg + ("Proszę podać nazwisko pasażera nr: " + i + "\n");
    }
  }
  return msg;
}

var optionArray = [];

function createPassengersArray(passNum) {
  for (let i = 1; i <= passNum; i++) {
    let passenger = {};
    passenger.id = i;
    passenger.name = document.getElementById('passenger-' + i + '-name-id').value;
    passenger.surname = document.getElementById('passenger-' + i + '-surname-id').value;
    passenger.cabinbag = document.getElementById('passenger-' + i + '-cabinbag-id').checked;
    passenger.register = document.getElementById('passenger-' + i + '-register-id').checked;
    passenger.seat = seatsSorted[i - 1];
    optionArray.push(passenger);
  }
}

function goToSummary() {
  var msg = "";
  msg = validatePassengersData(seats.length);
  if (msg == "") {
    createPassengersArray(seats.length);
    optionsVar.style.display = "none";
    finalSumVar.style.display = "block";
    finalSummaryDisplay();
  } else {
    window.alert(msg);
  }
}

function finalSummaryDisplay() {
  let sumContainer = document.getElementById('final-summary-pass-output');
  let fragment = new DocumentFragment();

  document.getElementById('final-summary-user-name').innerHTML = loginObject.name + " " + loginObject.surname;
  document.getElementById('final-summary-user-email').innerHTML = loginObject.email;

  for (let i = 0; i < optionArray.length; i++) {
    let container = document.createElement('div');
    container.setAttribute('class', 'passenger-sum-div');
    container.setAttribute('id', 'passenger-sum-div-' + i + '-id');

    let header1 = document.createElement("h3");
    header1.setAttribute('class', 'passenger-sum-header');
    header1.setAttribute('id', 'passenger-sum-header' + i + '-id');
    header1.setAttribute('style', 'font-weight: bold');
    header1.innerHTML = "Pasażer " + optionArray[i].id + ":<br>";

    let paraSeat = document.createElement("p");
    paraSeat.setAttribute('class', 'passenger-sum-para');
    paraSeat.innerHTML = "Miejsce w samolocie: ";
    let spanSeat = document.createElement("span");
    spanSeat.setAttribute('class', 'passenger-sum-span');
    spanSeat.innerHTML = optionArray[i].seat;
    paraSeat.appendChild(spanSeat);

    let paraName = document.createElement("p");
    paraName.setAttribute('class', 'passenger-sum-para');
    paraName.innerHTML = "Imię i nazwisko: ";
    let spanName = document.createElement("span");
    spanName.setAttribute('class', 'passenger-sum-span');
    spanName.innerHTML = optionArray[i].name + " " + optionArray[i].surname;
    paraName.appendChild(spanName);

    let paraCabinbag = document.createElement("p");
    paraCabinbag.setAttribute('class', 'passenger-sum-para');
    paraCabinbag.innerHTML = "Dodatkowa torba kabinowa 55x40x20 cm: ";
    let spanCabinbag = document.createElement("span");
    spanCabinbag.setAttribute('class', 'passenger-sum-span');
    spanCabinbag.innerHTML = optionArray[i].cabinbag ? "tak" : "nie";
    paraCabinbag.appendChild(spanCabinbag);

    let paraRegister = document.createElement("p");
    paraRegister.setAttribute('class', 'passenger-sum-para');
    paraRegister.innerHTML = "Bagaż rejestrowany 20 kg: ";
    let spanRegister = document.createElement("span");
    spanRegister.setAttribute('class', 'passenger-sum-span');
    spanRegister.innerHTML = optionArray[i].register ? "tak" : "nie";
    paraRegister.appendChild(spanRegister);

    container.appendChild(header1);
    container.appendChild(paraSeat);
    container.appendChild(paraName);
    container.appendChild(paraCabinbag);
    container.appendChild(paraRegister);
    fragment.appendChild(container);
  }
  sumContainer.appendChild(fragment);
}

function returnToChooseSeat() {
  optionsVar.style.display = "none";
  if (searchResult.plane == "ATR 42-600") {
    smAtrVar.style.display = "block";
  }
  else {
    smAirbusVar.style.display = "block";
  }
  resetSeats();
  document.getElementById('sum16').innerHTML = 0;
  document.getElementById('sum17').innerHTML = sumValueArray[16];
  document.getElementById('sum18').innerHTML = 0;
  document.getElementById('sum19').innerHTML = sumValueArray[18];
  document.getElementById('sum20').innerHTML = sumValueArray[19];
  removeChildren(passOptVar);
}

document.getElementById("return-to-start-4-id").onclick = returnToSearch;
document.getElementById("finish-button-id").onclick = goToFinish;

function goToFinish() {
  finishVar.style.display = "block";
  finalSumVar.style.display = "none";
}

document.getElementById("return-to-options").onclick = returnToOptions;

function returnToOptions() {
  optionsVar.style.display = "block";
  finalSumVar.style.display = "none";
  optionArray = [];
  removeChildren(finalSumPassVar);
}

document.getElementById("return-to-start-5-id").onclick = returnToSearch;
document.getElementById("return-to-start-6-id").onclick = returnToSearch;