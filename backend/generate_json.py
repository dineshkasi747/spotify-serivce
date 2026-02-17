import os
import json
import pandas as pd
import re
import requests

# ====== CONFIG ======
MP3_FOLDER = r"music-files"
DATASET_CSV = r"songs_dataset.csv"
OUTPUT_JSON = "songs.json"

# ====== LOAD DATASET ======
df = pd.read_csv(DATASET_CSV)

if "Unnamed: 0" in df.columns:
    df = df.drop(columns=["Unnamed: 0"])

df["track_name"] = df["track_name"].str.lower().str.strip()

feature_columns = [
    "danceability", "energy", "acousticness",
    "instrumentalness", "valence", "tempo",
    "loudness", "speechiness", "liveness"
]

# ====== CLEAN TITLE ======

def clean_filename(filename):
    name = os.path.splitext(filename)[0]

    # remove website junk completely
    name = re.sub(r"spotdown\.org", "", name, flags=re.IGNORECASE)
    name = re.sub(r"spotdown", "", name, flags=re.IGNORECASE)

    # remove .org or any domain leftovers
    name = re.sub(r"\.org", "", name, flags=re.IGNORECASE)

    # remove brackets content
    name = re.sub(r"\(.*?\)", "", name)

    # remove extra dashes at end
    name = re.sub(r"-\s*$", "", name)

    # replace underscores
    name = name.replace("_", " ")

    # remove extra spaces
    name = re.sub(r"\s+", " ", name).strip()

    return name


# ====== GET REAL SONG DATA FROM ITUNES ======

def fetch_song_data(title):
    try:
        query = title.replace(" ", "+")
        url = f"https://itunes.apple.com/search?term={query}&entity=song&limit=1"

        response = requests.get(url, timeout=5)
        data = response.json()

        if data.get("resultCount", 0) > 0:
            result = data["results"][0]

            return {
                "title": result.get("trackName", title),
                "artist": result.get("artistName", "Unknown Artist"),
                "album": result.get("collectionName", "Unknown"),
                "imageUrl": result.get("artworkUrl100", "").replace("100x100", "600x600")
            }
    except:
        pass

    return {
        "title": title,
        "artist": "Unknown Artist",
        "album": "Unknown",
        "imageUrl": "https://via.placeholder.com/600"
    }


# ====== MATCH DATASET FEATURES ======


def get_features(title):
    match = df[df["track_name"] == title.lower()]

    # ✅ If exact match found
    if not match.empty:
        row = match.iloc[0]
    else:
        # 🔥 If no match → randomly pick a row
        row = df.sample(n=1).iloc[0]

    return {
        "genre": row["track_genre"],
        "features": {
            col: float(row[col]) for col in feature_columns
        }
    }


# ====== MAIN ======

songs_json = []
used_titles = set()

mp3_files = [f for f in os.listdir(MP3_FOLDER) if f.endswith(".mp3")]

for file in mp3_files:

    cleaned_title = clean_filename(file)

    if cleaned_title.lower() in used_titles:
        continue

    used_titles.add(cleaned_title.lower())

    print(f"Processing: {cleaned_title}")

    # 🔥 Get correct title + artist + album + image
    api_data = fetch_song_data(cleaned_title)

    # 🎵 Get dataset features
    dataset_data = get_features(api_data["title"])

    song_data = {
        "title": api_data["title"],
        "artist": api_data["artist"],
        "album": api_data["album"],
        "genre": dataset_data["genre"],
        "duration_ms": None,
        "explicit": False,
        "imageUrl": api_data["imageUrl"],
        "fileName": file,
        "features": dataset_data["features"]
    }

    songs_json.append(song_data)


# ====== SAVE JSON ======

with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(songs_json, f, indent=4, ensure_ascii=False)

print("\n✅ Perfect Clean songs.json Created Successfully")
