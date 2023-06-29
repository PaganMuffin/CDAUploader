## CDAUploader

Program służy do wrzucania plików na platformę CDA.pl za pomocą linii poleceń.

**Funkcje**

-   Logowanie
-   Ustawianie tytuły, opisu, widoczności (prywatny/publiczny)
-   Wrzucanie za pomocą linku lub z dysku

**TODO**

-   [ ] Pobieranie plików
-   [ ] Obsługa wszystkich możliwych błędów

**Dostępne opcje**

    -f, --file         Scieżka do pliku na dysku (wymagane)
    -l, --link         Link do pliku (wymagane)
    -d, --description  opis filmu, jeżeli nie podane program wygeneruje losowy hash
    -t, --title        tytuł filmu, jeżeli nie podane program wygeneruje losowy hash
    -u, --username     nazwa użytkownika
    -p, --password     hasło do konta
        --private      Ustawia wrzucanemu filmowi status prywatny
        --info         Wyswietlanie informacji o postępie wrzucania
