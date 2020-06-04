# fle
Flat Earth Aviation - system rezerwacji lotów

Projekt zaliczeniowy w ramach studiów podyplomowych „Programista front-end z Angular” na WSB Wydział zamiejscowy w Chorzowie. 
Rok 2019/2020.
Autor: Marcin Karolewicz.

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
Dane logowania do systemu rezerwacji: 
login – admin
hasło – admin
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

System zwróci się o podanie danych logowania po zaakceptowaniu wyników wyszukiwania lotu. Po prawidłowym logowaniu sesja będzie trwała 3 minuty, po czym nastąpi automatyczne wylogowanie w przypadku bezczynności. Kliknięcie klawiszem myszki restartuje zegar. Sam powrót do początku wyszukiwania nie spowoduje automatycznego wylogowania. Jak długo trwa sesja użytkownik nie zostanie poproszony o ponowne podanie danych logowania.
Wylogowanie automatyczne lub wylogowanie po wciśnięciu przycisku „Wyloguj”, spowoduje powrót do okna wyszukiwania. Dane oraz wybory sesji zostaną wyzerowane.

Dodatkowe informacje:
- System umożliwia wybór lotu w jedną lub w dwie strony.
- Wybór terminów lotów został ograniczonych do jednego roku naprzód jednak nie wcześniej niż w dniu wyszukiwania. 
- Przewidziano możliwość zresetowania wyboru miejsc w samolocie przyciskiem „Resetuj wybór”.
- Zaakceptowanie ostatecznego podsumowania przenosi na końcowy ekran podziękowań za wybór linii. Z ekranu tego możliwe jest jedynie przejście do ekranu początkowego i rozpoczęcie wyszukiwania od początku.
