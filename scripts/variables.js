/*
===============================================================================
Tworzenie zmiennych globalnych
===============================================================================
*/

var searchResult = {}; //zmienna na wyniki wyszukiwania
var returnResult = {}; //zmienna na wyniki wyszukiwania lotu powrotnego
var loginObject = {} //zmienna na dane logowania
var loggedIn = false; //zmienna wskazująca czy jesteśmy zalogowani - domyślnie nie
var timeout;
var intervalLog;

const flightFromVariable = document.getElementById("flight-from");
const flightToVariable = document.getElementById("flight-to");
const leavingDateVariable = document.getElementById("leaving-date");
const returnDateVariable = document.getElementById("return-date");
const numbPassVar = document.getElementById("number-passengers-id");
const returnVariable = document.getElementById("return");
const searchWinVar = document.getElementById("search-window-id");
const searchRstWrapVar = document.getElementById("search-result-wrapper-id");
const returnRstWrapVar = document.getElementById("return-flight-result-wrapper-id");
const logWinVar = document.getElementById("login-window-id");
const usernameVar = document.getElementById("username-id");
const logoutButtonVar = document.getElementById("logout-button-id");
const smAirbusVar = document.getElementById("seat-map-airbus-id");
const smAtrVar = document.getElementById("seat-map-ATR-id");
const optionsVar = document.getElementById("options-id");
const finalSumVar = document.getElementById("final-summary-id");
const finishVar = document.getElementById("finish-id");
const timerVar = document.getElementById("timer");

const passOptVar = document.getElementById("pass-options-id");
const finalSumPassVar = document.getElementById("final-summary-pass-output");