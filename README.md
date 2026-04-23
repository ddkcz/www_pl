# Moje Portfolio — Wersja dla Inżyniera Mechanika

Strona portfolio inspirowana rysunkami technicznymi — tło jak papier kreślarski,
tabliczki rysunkowe, oznaczenia wymiarowe i treść w duchu inżynierii.

## Jak używać

1. **Otwórz folder w VS Code**: File → Open Folder → wybierz `my-portfolio`
2. **Podgląd**: Kliknij prawym na `index.html` → "Open with Live Server"
3. **Personalizacja**: Użyj `Cmd+Shift+F`, żeby zamienić teksty we wszystkich plikach:
   - `Twoje Imię` → Twoje prawdziwe imię i nazwisko
   - `TWOJE.IMIĘ_M.E.` → Twoje inicjały lub krótkie logo
   - `twoj@email.pl` → Twój prawdziwy e-mail
   - `@twojlogin` → Twoja nazwa na GitHubie
   - `/in/twojeimie` → Twój adres LinkedIn

## Struktura

```
my-portfolio/
├── index.html        ← Start (hero + rysunek profilu)
├── about.html        ← O mnie + umiejętności
├── projects.html     ← Projekty z metadanymi rysunku
├── blog.html         ← Dziennik inżyniera
├── contact.html      ← Kontakt + formularz
├── css/style.css     ← Cały styl
├── js/script.js      ← Interaktywność (tryb ciemny, menu)
└── images/           ← Tutaj wrzuć zdjęcie profilowe
```

## Dodaj zdjęcie profilowe

1. Zapisz zdjęcie jako `images/profile.jpg`
2. W `index.html` i `about.html` znajdź `[ SKALA 1:1 ]` i zamień cały blok
   `<div class="profile-photo">...</div>` na:
   ```html
   <div class="profile-photo">
     <img src="images/profile.jpg" alt="Twoje Imię">
   </div>
   ```

## Zmiana kolorów

Edytuj `css/style.css` → sekcję `:root` na górze:
- `--accent: #c23a1e;` → spróbuj innego akcentu (np. niebieski kreślarski: `#2c4a6b`)
- `--paper: #f4f1ea;` → kolor tła papieru
- `--ink: #1a2332;` → główny kolor tekstu

## Tryb ciemny / jasny

Przycisk w prawym górnym rogu przełącza tryby. Wybór jest zapamiętywany
pomiędzy wizytami.

## Publikacja w internecie (darmowa)

Gdy strona jest gotowa:
1. Załóż konto na github.com
2. Stwórz repozytorium o nazwie `twojlogin.github.io`
3. Wgraj pliki
4. Strona będzie dostępna pod `https://twojlogin.github.io`
