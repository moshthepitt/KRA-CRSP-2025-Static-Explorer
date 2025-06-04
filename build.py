# build.py  ── run:  python build.py
import pandas as pd, json, re, pathlib, gzip

SRC = "New-CRSP---July-2025.xlsx"
OUT = pathlib.Path("site/data")
OUT.mkdir(parents=True, exist_ok=True)

nice = {
    r"model\s*number": "model_number",
    r"engine\s*capacity": "engine_cc",
    r"drive\s*configuration": "drive",
    r"body\s*type": "body",
    r"crsp.*": "crsp",
    r"gvw": "gvw",
    r"seating": "seats",
}

def tidy(col):
    c = re.sub(r"\s+", " ", str(col)).strip().lower()
    for pat, repl in nice.items():
        if re.fullmatch(pat, c):
            return repl
    return c.replace(" ", "_")

xls = pd.ExcelFile(SRC)
for sheet in xls.sheet_names[:3]:            # ignore the blank TEMPLATE sheet
    df = pd.read_excel(SRC, sheet_name=sheet, header=1)
    df.columns = [tidy(c) for c in df.columns]
    # The following line was for removing 'unnamed:_X' columns, which is not needed
    # as header=1 correctly identifies the true headers.
    # df = df.loc[:, [col for col in df.columns if not re.fullmatch(r'unnamed:_\d+', col)]]
    df = df.dropna(how="all")
    # export minified and gzipped JSON → e.g. vehicle.json.gz
    # Determine fname_base to match HTML select values
    temp_name = sheet.lower()
    if "m.vehicle" in temp_name: # Handles "M.Vehicle Sheet" or similar
        fname_base = "vehicle"
    elif "motor cycle" in temp_name: # Handles "Motor Cycles" or similar
        fname_base = "motorcycles"
    elif "tractor" in temp_name: # Handles "Tractors" or similar
        fname_base = "tractors"
    else: # Fallback for any other sheets, though we primarily care about the first three
        fname_base = sheet.split()[0].lower().replace('.', '')
    gz_path = OUT / f"{fname_base}.json.gz"

    # Convert to JSON string (minified)
    # Ensure all data is converted to basic types to avoid JSON serialization errors with Pandas/Numpy types
    df_serializable = df.astype(object).where(pd.notnull(df), None)
    json_data = df_serializable.to_json(orient="records", indent=None)

    # Write to .json.gz file
    with gzip.open(gz_path, "wt", encoding="utf-8") as f_gz:
        f_gz.write(json_data)
    print(f"Processed and wrote: {gz_path}")
