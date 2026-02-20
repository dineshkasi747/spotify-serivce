import os
import json
import re
import requests
import base64
import time
from urllib.parse import quote

# ================= CONFIG =================

SPOTIFY_CLIENT_ID = "3a8b25a51d284faabe4fc09e957028a8"
SPOTIFY_CLIENT_SECRET = "a1f0b249b3344b34871105021c5b7fbb"

MP3_FOLDER = r"music-files"
OUTPUT_JSON = "songs.json"

# ================= GET SPOTIFY TOKEN =================

def get_spotify_token():
    auth_string = f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}"
    auth_bytes = auth_string.encode("utf-8")
    auth_base64 = base64.b64encode(auth_bytes).decode("utf-8")

    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": f"Basic {auth_base64}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {"grant_type": "client_credentials"}

    response = requests.post(url, headers=headers, data=data)

    if response.status_code != 200:
        print("❌ Failed to get Spotify token")
        print(response.text)
        exit()

    return response.json()["access_token"]


# ================= CLEAN FILENAME =================

def clean_filename(filename):
    name = os.path.splitext(filename)[0]

    # Remove junk text
    name = re.sub(r"spotdown\.org", "", name, flags=re.IGNORECASE)
    name = re.sub(r"\(.*?\)", "", name)
    name = name.replace("_", " ")
    name = re.sub(r"\s+", " ", name).strip()

    return name


# ================= SAFE SPOTIFY REQUEST =================

def safe_request(url, token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)

    # Handle rate limiting
    if response.status_code == 429:
        retry_after = int(response.headers.get("Retry-After", 2))
        print(f"⏳ Rate limited. Waiting {retry_after} seconds...")
        time.sleep(retry_after)
        return safe_request(url, token)

    if response.status_code != 200:
        print(f"❌ Spotify API Error {response.status_code}")
        print(response.text)
        return None

    try:
        return response.json()
    except:
        print("⚠ Invalid JSON received")
        return None


# ================= SEARCH SONG =================

def search_song(title, token):
    query = quote(title)
    url = f"https://api.spotify.com/v1/search?q={query}&type=track&limit=1"

    data = safe_request(url, token)

    if not data or not data.get("tracks") or not data["tracks"]["items"]:
        return None

    track = data["tracks"]["items"][0]

    image_url = ""
    if track["album"]["images"]:
        image_url = track["album"]["images"][0]["url"]

    return {
        "track_id": track["id"],
        "title": track["name"],
        "artist": track["artists"][0]["name"],
        "album": track["album"]["name"],
        "imageUrl": image_url,
        "releaseYear": track["album"]["release_date"][:4] if track["album"].get("release_date") else None,
        "duration": track["duration_ms"]
    }


# ================= GET AUDIO FEATURES =================

def get_audio_features(track_id, token):
    url = f"https://api.spotify.com/v1/audio-features/{track_id}"
    data = safe_request(url, token)

    if not data:
        return {
            "danceability": 0.5,
            "energy": 0.5,
            "acousticness": 0.5,
            "instrumentalness": 0.0,
            "valence": 0.5,
            "tempo": 120,
            "speechiness": 0.05,
            "liveness": 0.1,
            "loudness": -10,
        }

    return {
        "danceability": data.get("danceability", 0.5),
        "energy": data.get("energy", 0.5),
        "acousticness": data.get("acousticness", 0.5),
        "instrumentalness": data.get("instrumentalness", 0.0),
        "valence": data.get("valence", 0.5),
        "tempo": data.get("tempo", 120),
        "speechiness": data.get("speechiness", 0.05),
        "liveness": data.get("liveness", 0.1),
        "loudness": data.get("loudness", -10),
    }


# ================= MAIN =================

def generate_json():
    token = get_spotify_token()
    print("✅ Spotify Token Generated\n")

    songs_json = []
    used_titles = set()

    if not os.path.exists(MP3_FOLDER):
        print("❌ music-files folder not found")
        return

    mp3_files = [f for f in os.listdir(MP3_FOLDER) if f.endswith(".mp3")]

    for file in mp3_files:
        cleaned_title = clean_filename(file)

        if cleaned_title.lower() in used_titles:
            continue

        used_titles.add(cleaned_title.lower())

        print(f"🎵 Processing: {cleaned_title}")

        song_meta = search_song(cleaned_title, token)

        if not song_meta:
            print("❌ Not found on Spotify\n")
            continue

        features = get_audio_features(song_meta["track_id"], token)

        song_data = {
            "track_id": song_meta["track_id"],
            "title": song_meta["title"],
            "artist": song_meta["artist"],
            "album": song_meta["album"],
            "genre": "",
            "duration": song_meta["duration"],
            "releaseYear": song_meta["releaseYear"],
            "imageUrl": song_meta["imageUrl"],
            "fileName": file,
            "features": features
        }

        songs_json.append(song_data)
        print("✅ Added\n")

        # small delay to avoid rate limit
        time.sleep(0.3)

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(songs_json, f, indent=4, ensure_ascii=False)

    print("\n🎉 songs.json created successfully!")


# ================= RUN =================

generate_json()
