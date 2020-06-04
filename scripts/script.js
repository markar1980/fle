/*
===============================================================================
Tworzenie zmiennych globalnych
===============================================================================
*/
var searchResult = {}; //zmienna na wyniki wyszukiwania
var returnResult = {}; //zmienna na wyniki wyszukiwania lotu powrotnego
var loginObject = {} //zmienna na dane logowania
var loggedIn = false; //zmienna wskazująca czy jesteśmy zalogowani - domyślnie nie

/*
===============================================================================
Skrypt przełączający możliwość wyboru daty lotu powrotnego. Funkcja uruchamiana
przez wybór rodzaju lotu w oknie wyszukiwania
===============================================================================
*/
function allowReturn(radio) {
  if (radio.value == "2") {
    document.getElementById("return-date").disabled = true;
  } else {
    document.getElementById("return-date").disabled = false;
  }
}

/*
===============================================================================
Poniższy kod ustawia początkową datę minimalną i maksymalną dla inputów 
leavind-date oraz return-date. Celem jest uniemożliwienie wyboru wcześniejszego
dnia lotu niż dzień dzisiejszy i późniejszego niż za rok od dzisiaj 
(zgodnie z wytycznymi projektu).
===============================================================================
*/
var todayISO = new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000).toISOString().split("T")[0];
var tomorrow = new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000);
//powyżej uwzględniono czas lokalny; można uwzględnić UTC co skróci kod do: „var todayISO = new Date().toISOString().split("T")[0];” i „var tomorrow = new Date();”
//getTimezoneOffset() zwraca różnicę stref czasowych w minutach - mnożenie przez 60000 w celu wyrażenia w milisekundach
//toISOString zwraca datę jako string w standardzie ISO-8601: YYYY-MM-DDTHH:mm:ss.sssZ a następie spli("T")[0] wyciąga samą datę dzienną bez godziny
var year = new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000);
tomorrow.setDate(tomorrow.getDate() + 1);
//wyciągamy dzień miesiąca z początkowej wartości tommorow i dodajemy jeden dzień
year.setDate(year.getDate() + 365);
//wyciągamy dzień miesiąca z początkowej wartości year i dodajemy 365 dni
var tomorrowISO = tomorrow.toISOString().split("T")[0];
var yearISO = year.toISOString().split("T")[0];
document.getElementById("leaving-date").min = todayISO;
document.getElementById("leaving-date").max = yearISO;
document.getElementById("return-date").min = tomorrowISO;
document.getElementById("return-date").max = yearISO;
document.getElementById("leaving-date").addEventListener('change', setMinReturn);

/*
===============================================================================
System rezerwacji zakłada, że lot powrotny nastąpi najwcześniej następnego dnia
po dniu lotu w tamtą stronę.
Poniższa funkcja ustawia minimalną return-date na dzień po wybranej leaving-date.
Funckja jest wywoływana zmianą pola leaving-date w oknie wyszukiwania
===============================================================================
*/
function setMinReturn() {
  var leavingDate = document.getElementById("leaving-date").valueAsDate;
  if (leavingDate != null) {
    var returnDate = new Date(leavingDate);
    returnDate.setDate(leavingDate.getDate() + 1);
    document.getElementById("return-date").min = returnDate.toISOString().split("T")[0];
    if (document.getElementById("leaving-date").valueAsDate != null && document.getElementById("return-date").valueAsDate != null) {
      checkFlightDate() ? true /*alert('ok')*/ : alert('Data powrotu nie może być wcześniejasz lub równa dacie lotu docelowego');
    }
  } else {
    document.getElementById("return-date").min = tomorrowISO;
  }
}

/*
===============================================================================
Funkcja sprawdza czy data powrotna nie jest wcześniejsza niż data lotu w tamtą 
stronę i przypisuje wartość zmiennej tak/nie
===============================================================================
*/
function checkFlightDate() {
  var returnDate = document.getElementById("return-date");
  return ((returnDate.valueAsDate.toISOString().split("T")[0] < returnDate.min) ? false : true);
}

/*
===============================================================================
Funckja która uruchamia skrypt wczytania JSON - loadFlightData(), w zależności od
podania kompletu danych. Jeśli lot jest w jedną stronę trzy pola muszą być pełne,
jeśli lot jest w dwie strony, cztery pola muszą być pełne.
Ponadto pola miejsca startu oraz miejsca docelowego nie mogą być tożsame.
===============================================================================
*/
document.getElementById("search-button").onclick = allowSearch;

function allowSearch() {
  if (
    (document.getElementById("return-date").disabled == true) &&
    (document.getElementById("flight-from").value != "") &&
    (document.getElementById("flight-to").value != "") &&
    (document.getElementById("leaving-date").value != "")
  ) {
    if (document.getElementById("flight-from").value == document.getElementById("flight-to").value) {
      window.alert("Miejsce wylotu i docelowe nie mogą być tożsame")
    }
    else
      loadFlightData();
  }
  else if (
    (document.getElementById("return-date").disabled == false) &&
    (document.getElementById("flight-from").value != "") &&
    (document.getElementById("flight-to").value != "") &&
    (document.getElementById("leaving-date").value != "") &&
    (document.getElementById("return-date").value != "") &&
    checkFlightDate()
  ) {
    if (document.getElementById("flight-from").value == document.getElementById("flight-to").value) {
      window.alert("Miejsce wylotu i docelowe nie mogą być tożsame");
    }
    else
      loadFlightData();
  }
  else { window.alert("Proszę wypełnić prawidłowo wszystkie wymagane pola wyszukiwania"); }
}

//funkcja wczytująca json i przekazująca obiekt jsonFlights do funkcji wyszukiwania
function loadFlightData() {
  const url = "https://raw.githubusercontent.com/markar1980/fle/master/JSON/dataJSON.json";
  fetch(url)
    .then(response => response.json())
    .then(data => searchFlight(data.jsonFlights))
    .catch(err => console.error(err));
}

/*
===============================================================================
Funkcja wyszukiwania

Skrypt uruchamiający wyszukiwanie po wciśnięciu klawisza "szukaj" jeśli 
spełnione są warunki funkcji allowSearch.

W następstwie wywołania funkcji zostają utworzone obiekty:
- searchResult() - zawsze
- returnResult() - tylko w sytuacji jeśli wyszukiwany jest lot w dwie strony
Obiekty zawierają podstawowe dane dotyczace lotów, wykorzystywane w kolejnych 
partiach kodu, takie jak:
miejsce wylotu, miejsce docelowe, dzień lotu, czas lotu, godziny startu 
i lądowania, liczbę pasażerów, cenę podstawową, cenę dodatkowego bagażu 
kabinowego, cenę bagażu rejestrowego, rodzaj samolotu.

Część danych zwracana jest następnie na stronie wyników wyszukiwania
===============================================================================
*/
function searchFlight(jsonFlights) {
  var returnFlight = document.getElementById("return").checked;
  /*zmienna sprawdzająca czy lot jest powrotny - jeśli tak będzie true, w przeciwnym wypadku false*/
  if (returnFlight == true) {
    document.getElementById("search-window-id").style.display = "none";
    document.getElementById("search-result-wrapper-id").style.display = "inline-block";
    document.getElementById("return-flight-result-wrapper-id").style.display = "inline-block";
  }
  else {
    document.getElementById("search-window-id").style.display = "none";
    document.getElementById("search-result-wrapper-id").style.display = "inline-block";
    document.getElementById("return-flight-result-wrapper-id").style.display = "none";
  }
  /*Poniższy fragment kodu tworzy zmienne na podstawie informacji podanych w formularzu wyszukiwania */
  var flightFrom = document.getElementById("flight-from").value;
  var flightTo = document.getElementById("flight-to").value;
  var leavingDate = document.getElementById("leaving-date").value;
  var returnDate = document.getElementById("return-date").value;
  var numberPassengers = document.getElementById("number-passengers-id").value;
  /*W pliku JSON zawierającym obiekty określające warianty lotów zostaje wyszukany 
  lot który spełnia zarówno warunek miejsca startowego i miejsca docelotwego dla lotu w jedną stronę, 
  a następnie obiekt searchResult{} zostaje wypełniony elementami*/
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
    document.getElementById("sum1").innerHTML = searchResult.from;
    document.getElementById("sum2").innerHTML = searchResult.to;
    document.getElementById("sum3").innerHTML = searchResult.passengers;
    document.getElementById("sum4").innerHTML = returnFlight ? "tak" : "nie";
    document.getElementById("sum5").innerHTML = searchResult.day;
    document.getElementById("sum6").innerHTML = searchResult.start;
    document.getElementById("sum7").innerHTML = searchResult.end;
    document.getElementById("sum11").innerHTML = searchResult.time;
    document.getElementById("sum12").innerHTML = searchResult.plane;
    document.getElementById("sum13").innerHTML = searchResult.price + ",00 zł";
    document.getElementById("sum14").innerHTML = (searchResult.price * searchResult.passengers + ",00 zł");
    document.getElementById("sum16").innerHTML = 0;
    document.getElementById("sum17").innerHTML = 0 + ",00 zł";
    document.getElementById("sum18").innerHTML = 0;
    document.getElementById("sum19").innerHTML = 0 + ",00 zł";
    document.getElementById("sum20").innerHTML = (searchResult.price * searchResult.passengers + ",00 zł");
  }

  console.log(searchResult);

  /*Poniżsyz kod wypełnia kafelki z wynikami wyszukiwania lotu*/
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

  /*zmienna teczhniczna - utworzona na potrzeby debugowania*/
  var planeType = searchResult.plane;
  console.log("Rodzaj samolotu to: " + planeType);

  if (returnFlight == true) {
    /*Utworzony zostaje obiekt z wynikami wyszukiwania lotu powrotnego*/
    returnResult = {};
    /*W pliku JSON zawierającym obiekty określające warianty lotów zostaje wyszukany 
lot który spełnia zarówno warunek miejsca startowego i miejsca docelotwego dla lotu powrotnego, 
a następnie obiekt returnResult{} zostaje wypełniony elementami*/
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
        console.log(returnResult);

        /*Poniżsyz kod wypełnia kafelki z wynikami wyszukiwania lotu powrotnego*/
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
    document.getElementById("sum8").innerHTML = returnResult.day;
    document.getElementById("sum9").innerHTML = returnResult.start;
    document.getElementById("sum10").innerHTML = returnResult.end;
    document.getElementById("sum14").innerHTML = (searchResult.price * 2 * searchResult.passengers + ",00 zł");
    document.getElementById("sum20").innerHTML = (searchResult.price * 2 * searchResult.passengers + ",00 zł");
  }
}

/*
===============================================================================
Skrypt powodujący powrót do okna wyszukiwania
===============================================================================
*/
document.getElementById("return-to-search-id").addEventListener("click", returnToSearch);

function returnToSearch() {
  searchResult = {};
  returnResult = {};
  optionArray = [];
  document.getElementById("search-window-id").style.display = "block";
  document.getElementById("search-result-wrapper-id").style.display = "none";
  document.getElementById("login-window-id").style.display = "none";
  document.getElementById("seat-map-airbus-id").style.display = "none";
  document.getElementById("seat-map-ATR-id").style.display = "none";
  document.getElementById("options-id").style.display = "none";
  document.getElementById("final-summary-id").style.display = "none";
  document.getElementById("finish-id").style.display = "none";
  resetSeats();
  document.getElementById("sum1").innerHTML = "";
  document.getElementById("sum2").innerHTML = "";
  document.getElementById("sum3").innerHTML = "";
  document.getElementById("sum4").innerHTML = "";
  document.getElementById("sum5").innerHTML = "";
  document.getElementById("sum6").innerHTML = "";
  document.getElementById("sum7").innerHTML = "";
  document.getElementById("sum8").innerHTML = "";
  document.getElementById("sum9").innerHTML = "";
  document.getElementById("sum10").innerHTML = "";
  document.getElementById("sum11").innerHTML = "";
  document.getElementById("sum12").innerHTML = "";
  document.getElementById("sum13").innerHTML = "";
  document.getElementById("sum14").innerHTML = "";
  document.getElementById("sum16").innerHTML = "";
  document.getElementById("sum17").innerHTML = "";
  document.getElementById("sum18").innerHTML = "";
  document.getElementById("sum19").innerHTML = "";
  document.getElementById("sum20").innerHTML = "";
  removeChildren(document.getElementById("pass-options-id"));
  removeChildren(document.getElementById("final-summary-pass-output"));
}

/*
===============================================================================
Skrypt powodujący przejście do okna logowania
===============================================================================
*/
document.getElementById("go-to-login-id").addEventListener("click", goToLogin);

function goToLogin() {
  if (loggedIn == false) {
    document.getElementById("login-window-id").style.display = "block";
    document.getElementById("search-result-wrapper-id").style.display = "none";
  }
  else {
    document.getElementById("search-result-wrapper-id").style.display = "none";
    openSeatMap();
  }
};

/*
===============================================================================
Skrypt logowania
===============================================================================
*/
document.getElementById("log-button-id").onclick = loadUsersData;

//funkcja wczytująca plik json i przekazująca obiekt jsonLogin do funkcji logowania
function loadUsersData() {
  const url = "https://raw.githubusercontent.com/markar1980/fle/master/JSON/dataJSON.json";
  fetch(url)
    .then(response => response.json())
    .then(data => logIn(data.jsonLogin))
    .catch(err => console.error(err));
}

var timeout = 3 * 60000; //3 minuty => 3 * 60000
var intervalLog;

function logIn(jsonLogin) {
  for (let i = 0; i < jsonLogin.length; i++) {
    if ((jsonLogin[i].user == document.getElementById("username-id").value) &&
      (jsonLogin[i].pass == document.getElementById("password-id").value)) {
      loginObject = {
        user: document.getElementById("username-id").value,
        password: "",
        name: jsonLogin[i].name,
        surname: jsonLogin[i].surname,
        email: jsonLogin[i].email
      };
      console.log(loginObject);
      loggedIn = true;
      console.log("Zalogowany: " + loggedIn);
      document.getElementById("login-window-id").style.display = "none";
      document.getElementById("logout-button-id").style.display = "block";
      openSeatMap();//uruchamia funkcję wyboru mapy siedzeń w zależności od rodzaju samolotu
      setupTimers(); //uruchamia timer        
    } else {
      window.alert("Proszę wprowadzić prawidłowe dane logowania");
    }
  }
}

function logOut(isIdle) {
  clearInterval(intervalLog);
  timeout = 3 * 60000;
  document.getElementById("timer").innerHTML = "nie jesteś zalogowany";
  returnToSearch();
  loggedIn = false;
  loginObject = {};
  document.getElementById("logout-button-id").style.display = "none";
  if (isIdle) {
    window.alert("Zostałeś wylogowany z powodu bezczynności");
  }
  console.log("Zalogowany: " + loggedIn);
}

function startTimer() {
  timeout = 3 * 60000;
  intervalLog = setInterval(logoutTimer, 1000);
}

// timer
function logoutTimer() {
  var minutes = Math.floor((timeout % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((timeout % (1000 * 60)) / 1000);
  //metoda Math.floor zaokrągla wartość do najniższej wartości całkowitej
  //Sposób liczenia zmiennych w przypadku zmiany wartości timeout jest automatycznie przeliczany na minuty i sekundy
  minutes = checkTime(minutes);
  seconds = checkTime(seconds);
  document.getElementById("timer").innerHTML = minutes + ":" + seconds;
  (timeout < 0) ? logOut(true) : timeout -= 1000;
  //w sytuacji kiedy timeout dojdzie do zera uruchamia funkcję wylogowania w przeciwnym wypadku pomniejsza wartośći co sekundę.
}

//timer reset
function resetTimer() {
  if (loggedIn) {
    clearInterval(intervalLog);
    startTimer();
  }
}

//Poniższy skrypt resetuje timer po kliknięciu, można rozszerzyć opcje resetowania
function setupTimers() {
  // document.addEventListener("mousemove", resetTimer, false);
  document.addEventListener("mousedown", resetTimer, false);
  // document.addEventListener("keypress", resetTimer, false);
  // document.addEventListener("touchmove", resetTimer, false);
  // document.addEventListener("onscroll", resetTimer, false);
  startTimer();
}

// dodaje 0 przed sekundą / minutą
function checkTime(i) {
  return (i < 10 ? i = "0" + i : i);
}

/*
===============================================================================
Skrypt wylogowania z przycisku
===============================================================================
*/
function logOutButton() {
  var acpt = confirm("Czy na pewno chcesz się wylogować?");
  if (acpt == true) {
    logOut(false);
  }
}

/*
===============================================================================
Skrypt powodujący podwót do okna z wynikami wyszukiwania
===============================================================================
*/
document.getElementById("returng-to-search-id-log").onclick = returnToResults;

function returnToResults() {
  document.getElementById("search-result-wrapper-id").style.display = "block";
  document.getElementById("login-window-id").style.display = "none";
}

/*
===============================================================================
Skrypt powodujący przejście z okna logowania do początku
===============================================================================
*/
document.getElementById("return-to-start-1-id").onclick = returnToSearch;

/*
===============================================================================
Skrypt uruchamiający odpowiednie okno wyboru miejsca w samolocie w zależności
od rodzaju samolotu na danej trasie
===============================================================================
*/
function openSeatMap() {
  if (searchResult.plane == "ATR 42-600") {
    document.getElementById("seat-map-ATR-id").style.display = "block"
  }
  else {
    document.getElementById("seat-map-airbus-id").style.display = "block"
  }
}

/*
===============================================================================
Skrypt wyboru miejsca do siedzenia z mapy siedzeń
===============================================================================
*/
var seatArray = document.getElementsByClassName("seat");

for (let i = 0; i < seatArray.length; i++) {
  seatArray[i].addEventListener("click", chooseSeat);
}

var seats = [];
//tworzymy zmienną - tablicę, która bedzie wypełniana wybranymi numerami siedzeń
var seatsDisplay = [];
//tworzymy zmienną dla tablicy, która będzie zawierała nr siedzeń do wyświetlenia
var seatsSorted = [];
//tworzymy zmienną - tablicę, która bedzie wypełniana posortowanymi numerami siedzeń do wyświetlenia

function chooseSeat() {
  if (seats.length < document.getElementById("number-passengers-id").value) {
    var chooseSeatId = this.id;
    if (seats.indexOf(chooseSeatId) == -1) {
      var seatIdFragment = chooseSeatId.slice(2)//wycianmy tylko fragment ID, który checmy wyświetlić
      seats.push(chooseSeatId);
      seatsDisplay.push(seatIdFragment);
      seatsSorted = seatsDisplay.sort();
      document.getElementById("sum15").innerHTML = seatsSorted;
      changeColor();
    }
  }
  else { window.alert("Wybrałeś już maksymalną ilość miejsc") }
}

/*
===============================================================================
Funkcja zmieniająca kolor siedzenia po jego wyborze
===============================================================================
*/
function changeColor() {
  for (let i = 0; i < seats.length; i++) {
    var changeColorId = document.getElementById(seats[i]);
    changeColorId.style.fill = "green";
  }
}

/*
===============================================================================
Funkcja restartująca wybór siedzeń
===============================================================================
*/
function resetSeats() {
  for (let i = 0; i < seats.length; i++) {
    var changeColorId = document.getElementById(seats[i]);
    changeColorId.style.fill = "rgba(0,0,0,0.5)";
  }
  seats = [];
  seatsDisplay = [];
  console.log(seats);
  document.getElementById("sum15").innerHTML = "";
}

/*
===============================================================================
Skrypt powodujący powrót do okna z wynikami wyszukiwania
Samolot mały
===============================================================================
*/
document.getElementById("return-to-search-id-s").onclick = returnToResults2;

function returnToResults2() {
  document.getElementById("search-result-wrapper-id").style.display = "block";
  document.getElementById("seat-map-ATR-id").style.display = "none";
  resetSeats();
}

/*
===============================================================================
Skrypt powodujący powrót do okna z wynikami wyszukiwania
Samolot duży
===============================================================================
*/
document.getElementById("return-to-search-id-m").onclick = returnToResults3;

function returnToResults3() {
  document.getElementById("search-result-wrapper-id").style.display = "block";
  document.getElementById("seat-map-airbus-id").style.display = "none";
  document.getElementById("seat-map-ATR-id").style.display = "none";
  resetSeats()
}

/*
===============================================================================
Skrypt powodujący przejście z okna wyboru miesjca do siedzania do początku
Samolot mały
===============================================================================
*/
document.getElementById("return-to-start-2-id").onclick = returnToSearch;

/*
===============================================================================
Skrypt powodujący przejście z okna wyboru miesjca do siedzania do początku
Samolot duży
===============================================================================
*/
document.getElementById("return-to-start-3-id").onclick = returnToSearch;

/*
===============================================================================
Funkja sprawdza czy wybrano siedzenia i jeżeli tak to uruchamia funckję
createPassengersDisplay która generuje tyle okien formularza dla opcji pasażerów
ilu jest pasażerów
===============================================================================
*/
function openOptions() {
  if (seats.length == searchResult.passengers) {
    document.getElementById("seat-map-ATR-id").style.display = "none";
    document.getElementById("seat-map-airbus-id").style.display = "none";
    document.getElementById("options-id").style.display = "block";
    createPassengersDisplay(seats.length);
  }
  else (window.alert("Proszę wybrać komplet miejsc"));
}

/*
===============================================================================
Funkcja tworzącą odpowiednią ilośc okien wyboru opcji w zależności od 
liczby pasażerów - patrz też funckja openOptions()
===============================================================================
*/
function createPassengersDisplay(passNum) {
  let fragment = new DocumentFragment();
  let passOptionsId = document.getElementById("pass-options-id"); //id generowanego formularza

  for (let i = 1; i <= seats.length; i++) {
    let container = document.createElement('div');
    container.setAttribute('class', 'passenger-div-' + i);
    container.setAttribute('id', 'passenger-div-' + i + '-id');
    //tworzymy tyle containerów na opcje dodatkowe ilu jest pasażerów

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
    //alternatywnie function (event){return cabinbagChange(event.target);}
    container.appendChild(document.createElement("br"));
    container.appendChild(label4);
    container.appendChild(input4);
    input4.onclick = (event) => registerChange(event.target);
    container.appendChild(document.createElement("hr"));
    fragment.appendChild(container);
  }
  passOptionsId.appendChild(fragment);
}

/*
===============================================================================
Funkcja removeChildren po jej wywołaniu odłącza dzieci od poszczególnych
wygenerowanych nodów - w przypadku nawigacji po systemie eliminuje to wielokrotne
genereowanie i dodawanie zbyt duże ilości pól
===============================================================================
*/
function removeChildren(parentNode) {
  while (parentNode.firstChild) {
    parentNode.removeChild(parentNode.firstChild);
  }
}

/*
===============================================================================
Funkcja wyboru i zliczania ilości wykupionych dodatkowych toreb kabinowych
===============================================================================
*/
function cabinbagChange(checkbox) {
  var cabinbagNumSpan = document.getElementById('sum16').innerHTML;
  var cabinbagNum = isNaN(parseInt(cabinbagNumSpan)) ? 0 : parseInt(cabinbagNumSpan);
  //jeżeli wartość w sum16 nie jest liczbą konieczne jest przypisanie wartości 0; jeśli jest liczba to parsuje do części całkowitej; eliminuje błąd w przypadku pustego stringa

  checkbox.checked ? cabinbagNum++ : cabinbagNum--;

  // jeżeli lot powrotny to mnoży razy dwa dopłatę za dodatkowe torby
  if (document.getElementById("return").checked) {
    document.getElementById('sum16').innerHTML = cabinbagNum;
    document.getElementById('sum17').innerHTML = 2 * cabinbagNum * searchResult.bag1 + ",00 zł";
    document.getElementById("sum20").innerHTML = (searchResult.price * 2 * searchResult.passengers + 2 * cabinbagNum * searchResult.bag1 + 2 * parseInt(document.getElementById('sum19').innerHTML) + ",00 zł");
  } else {
    document.getElementById('sum16').innerHTML = cabinbagNum;
    document.getElementById('sum17').innerHTML = cabinbagNum * searchResult.bag1 + ",00 zł";
    document.getElementById("sum20").innerHTML = (searchResult.price * searchResult.passengers + cabinbagNum * searchResult.bag1 + parseInt(document.getElementById('sum19').innerHTML) + ",00 zł");
  }
}

/*
===============================================================================
Funkcja wyboru i zliczania ilości wykupionych bagaży rejestrowych
===============================================================================
*/
function registerChange(checkbox) {
  var registerNumSpan = document.getElementById('sum18').innerHTML;
  var registerNum = isNaN(parseInt(registerNumSpan)) ? 0 : parseInt(registerNumSpan);

  checkbox.checked ? registerNum++ : registerNum--;

  // jeżeli lot powrotny to mnoży razy dwa dopłatę za dodatkowe torby
  if (document.getElementById("return").checked) {
    document.getElementById('sum18').innerHTML = registerNum;
    document.getElementById('sum19').innerHTML = 2 * registerNum * searchResult.bag2 + ",00 zł";
    document.getElementById("sum20").innerHTML = (searchResult.price * 2 * searchResult.passengers + 2 * parseInt(document.getElementById('sum17').innerHTML) + 2 * registerNum * searchResult.bag2 + ",00 zł");
  } else {
    document.getElementById('sum18').innerHTML = registerNum;
    document.getElementById('sum19').innerHTML = registerNum * searchResult.bag2 + ",00 zł";
    document.getElementById("sum20").innerHTML = (searchResult.price * searchResult.passengers + parseInt(document.getElementById('sum17').innerHTML) + registerNum * searchResult.bag2 + ",00 zł");
  }
}

/*
===============================================================================
Funkja sprawdza czy imiona i nazwiska pasażerów są podane - patrz też funkcja
goToSummary()
===============================================================================
*/
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

/*
===============================================================================
Funkja tworzy tablicę pasażerów
===============================================================================
*/
var optionArray = [];
// Tworzymy pustą tablicę pasażerów

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
  console.log("Tablica pasażerów optionArray: " + optionArray);
}

/*
===============================================================================
Funkja przejścia z ekranu opcji do ostatecznego podsumowania
===============================================================================
*/
function goToSummary() {
  var msg = "";
  //sprawdzany czy imię i nazwisko jest podane dla każdego pasażera
  msg = validatePassengersData(seats.length);

  if (msg == "") {
    //uzupełniamy tablicę pasażerów danymi jeżeli validacja nie zwróciła informacji o błędach (msg jest puste)
    createPassengersArray(seats.length);
    document.getElementById("options-id").style.display = "none";
    document.getElementById("final-summary-id").style.display = "block";
    finalSummaryDisplay();
  } else {
    window.alert(msg);
  }
}

/*
===============================================================================
Funkja wyświetlająca ostateczne podsumowanie
===============================================================================
*/
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

/*
===============================================================================
Funkja powrotu z ekranu opcji do okna wyboru miejsca w samolocie
===============================================================================
*/
function returnToChooseSeat() {
  document.getElementById("options-id").style.display = "none";
  if (searchResult.plane == "ATR 42-600") {
    document.getElementById("seat-map-ATR-id").style.display = "block";
  }
  else {
    document.getElementById("seat-map-airbus-id").style.display = "block";
  }
  resetSeats();
  removeChildren(document.getElementById("pass-options-id"));
}

/*
===============================================================================
Funkja powrotu z okna podsumowania do początku
===============================================================================
*/
document.getElementById("return-to-start-4-id").onclick = returnToSearch;

/*
===============================================================================
Funkja przejścia z okna podstumowania końcowego do okna końcowego
===============================================================================
*/
document.getElementById("finish-button-id").onclick = goToFinish;

function goToFinish() {
  document.getElementById("finish-id").style.display = "block";
  document.getElementById("final-summary-id").style.display = "none";
}

/*
===============================================================================
Funkja przejścia z okna podsumowania końcowego do okna opcji
===============================================================================
*/
document.getElementById("return-to-options").onclick = returnToOptions;

function returnToOptions() {
  document.getElementById("options-id").style.display = "block";
  document.getElementById("final-summary-id").style.display = "none";
  optionArray = [];
  removeChildren(document.getElementById("final-summary-pass-output"));
}

/*
===============================================================================
Funkja powrotu z okna podsumowania do początku
===============================================================================
*/
document.getElementById("return-to-start-5-id").onclick = returnToSearch;

/*
===============================================================================
Funkja powrotu z okna końcowych podziękowań do początku
===============================================================================
*/
document.getElementById("return-to-start-6-id").onclick = returnToSearch;
