# KRA‑CRSP Static Explorer

Browse Kenya’s **July 2025 Current Retail Selling Prices (CRSP)** without fighting a multi‑megabyte Excel file.

---

## 1  Why this mini‑site exists

Kenya Revenue Authority updates the CRSP tables at the start of every fiscal year. Every import levy on a used vehicle – Import Duty, Excise Duty, VAT, IDF and RDL – is calculated from the CRSP baseline. Unfortunately the official workbook is heavy, proprietary and awkward to search.

**TrueAfricanHistory.com** stripped out the data and wrapped it in a single‑page site that loads fast even on slow connections. The goal is practical transparency: put the raw numbers in your hands and let you decide what they mean for your wallet.

---

## 2  What the columns mean

| Column                      | Meaning                                            | Typical use                                 |
| --------------------------- | -------------------------------------------------- | ------------------------------------------- |
| `make`, `model`, `variant`  | Manufacturer’s canonical strings                   | Primary search keys                         |
| `body`, `drive`, `fuel`     | Body style, drivetrain and fuel type               | Narrow queries (e.g. “4×4 diesel pick‑ups”) |
| `engine_cc`, `seats`, `gvw` | Technical specification lines                      | Confirm the exact trim                      |
| `crsp` (KES)                | **Current Retail Selling Price**                   | Multiply by duty rates to estimate taxes    |
| `year_limit`                | Oldest model year allowed for import (8‑year rule) | Compliance check                            |

> **CRSP is not your invoice price.** It is KRA’s reference value; taxes are charged on this figure even if your declared cost is lower.

---

## 3  Features in < 10 KB of code

* Instant full‑text search across more than five thousand rows.
* Click any header to sort ascending or descending.
* Dropdown to switch between passenger vehicles, motorcycles and tractors.
* Pure vanilla JavaScript (≈ 6 KB) – no React, jQuery or DataTables.
* Data gzip‑compressed to roughly five hundred kilobytes total transfer.
* Works offline once cached – perfect for low‑bandwidth areas.

---

## 4  Building from scratch

```bash
# clone and build
git clone https://github.com/trueafricanhistory/kra-crsp-static.git
cd kra-crsp-static
python build.py          # creates data/*.json.gz

# serve on http://localhost:8080
python -m http.server 8080 --directory site
```

Open [http://localhost:8080](http://localhost:8080) in any modern browser.

---

## 5  Deploying to GitHub Pages

```bash
# create an orphan branch for the static site
git checkout --orphan gh-pages
mv site/* .
git add -A
git commit -m "deploy static explorer"
git push -u origin gh-pages --force
```

GitHub automatically marks `.gz` files with `Content-Encoding: gzip`, so browsers decompress transparently.

---

## 6  Updating when KRA releases new tables

1. Replace `New-CRSP---July-2025.xlsx` with the latest workbook.
2. Run `python build.py` – it overwrites the JSON files.
3. Commit and push. Done.

---

## 7  Contributing

* **Issues and feature requests** – open an issue.
* **Pull requests** – keep the script dependency‑light (Python 3.10+, `pandas`).
* **Translations** – add a locale key in `index.html` plus a matching `messages.json`.

---

## 8  Licence

* **Code:** MIT. Use freely; we make no warranty for your tax maths.
* **Data:** © [Kenya Revenue Authority](https://chatgpt.com/c/684040b7-87ac-800d-88c7-34d0d5c3e03a), reproduced here under fair‑dealing provisions for research and public information.

---

## 9  Credits

Built by the editorial and engineering team at **[TrueAfricanHistory.com](https://trueafricanhistory.com)**. If this tool helps you, share it widely and cite the source – every mention keeps independent African analysis alive.
