# Rynki

Lokalna aplikacja do monitorowania portfela, alokacji ETF i wskaźników rynkowych.

## Uruchomienie

Najprościej otworzyć projekt przez lokalny serwer HTTP:

```powershell
cd C:\Users\48501\Documents\Rynki
C:\Users\48501\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m http.server 8765 --bind 127.0.0.1
```

Potem wejść na:

```text
http://127.0.0.1:8765/index.html
```

## Tryb lokalny z aktualizacja danych

W docelowym trybie lokalnym sklad portfela edytujesz recznie w aplikacji, a dane rynkowe/newsowe pobiera skrypt:

```powershell
cd C:\Users\48501\Documents\Rynki
.\scripts\start_local.ps1
```

Skrypt najpierw uruchamia `scripts/update_data.py`, zapisuje `data/latest.json` oraz `data/rynki.sqlite`, a potem startuje lokalny serwer.

Bez kluczy API dzialaja obecnie zrodla publiczne:

- NBP: USD/PLN, EUR/PLN, JPY/PLN, zloto PLN/g.
- CoinGecko: krypto z `coingecko_id`.
- GDELT: newsy i wydarzenia.

Dla pelnych danych akcji/ETF dodaj klucz `ALPHA_VANTAGE_API_KEY` w lokalnym pliku `.env`. Stooq zostaje fallbackiem, ale moze byc blokowany przez weryfikacje przegladarki.

Zeby dane aktualizowaly sie automatycznie raz dziennie w Windows:

```powershell
cd C:\Users\48501\Documents\Rynki
.\scripts\install_daily_update_task.ps1
```

Domyslnie zadanie uruchamia sie o `07:30`. Godzine mozna zmienic:

```powershell
.\scripts\install_daily_update_task.ps1 -RunAt "18:00"
```

## Co jest w pierwszej wersji

- Import początkowych danych z PDF `Fins - II kw 2026`.
- Lokalna baza w przeglądarce przez `localStorage`.
- Formularz dodawania aktywów.
- Osobny podział XTB na IKE, IKZE i Portfel USD.
- Formularz ręcznego dodawania akcji i ETF-ów XTB z podstawowymi fundamentami.
- Eksport i import danych JSON.
- Podział majątku według klas aktywów.
- Panel wskaźników makro z ręcznym uzupełnianiem wartości i scoringu ryzyka.
- Moduł alokacji ETF USD z propozycją rebalancingu i argumentami za/przeciw.
- Moduł wykresów świecowych z próbą pobrania danych ze Stooq i importem OHLC CSV.
- Widoczny panel kursów USD/PLN, EUR/PLN, JPY/PLN oraz ceny złota PLN/g pobierany z oficjalnego API NBP.
- Wykresy kolowe/donut dla struktury majatku i podzialu XTB.
- Zakładka wiadomości z ręcznym feedem i szybkimi linkami do Google News dla tickerów z portfela.
- Zakładka potencjalnych okazji inwestycyjnych oparta o lokalne reguły i wpisane fundamenty.

## Kolejne dobre kroki

- Dodać backend z bazą SQLite, żeby dane nie zależały od jednej przeglądarki.
- Dodać automatyczne źródła danych: FRED, Stooq/Yahoo, AAII, VIX, PMI/ISM i przepływy funduszy.
- Dodać import PDF/CSV bezpośrednio z poziomu aplikacji.
- Rozdzielić aktywa bazowe od pozycji podsumowujących, żeby uniknąć podwójnego liczenia.
- Dodać konektor danych fundamentalnych: najlepiej przez eksport z InvestingPro, oficjalne API lub płatnego dostawcę danych. TradingView dobrze nadaje się do wykresów/widgetów, ale nie jest stabilnym źródłem do masowego pobierania fundamentów.

## Specyfikacja v2

Docelowy plan aplikacji, zrodla danych, moduly backendu i zasady jakosci sa opisane w:

- `docs/PRODUCT_SPEC.md`
- `config/portfolio.yaml`
- `.env.example`
