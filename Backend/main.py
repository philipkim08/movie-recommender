from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pickle
import numpy as np
import pandas as pd

app = FastAPI()

# ── CORS — allows your React frontend to talk to this backend ──────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your Vercel URL after deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load artifacts once at startup ─────────────────────────────────────────────
print("Loading recommender artifacts...")

with open("recommender_artifacts.pkl", "rb") as f:
    artifacts = pickle.load(f)

movie_df = artifacts["movie_df"]
indices = artifacts["indices"]
cosine_sim = np.load("cosine_sim.npy")

print(f"Loaded {len(movie_df)} movies successfully!")

# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "Movie Recommender API is running"}


@app.get("/movies")
def list_movies():
    try:
        movies = movie_df[["movieId", "title", "poster_url"]].copy()
        # Replace all NaN/Inf with None before returning
        movies = movies.replace({np.nan: None, np.inf: None, -np.inf: None})
        return movies.to_dict(orient="records")
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/recommend/{movie_title}")
def recommend(movie_title: str, n: int = 10):
    if movie_title not in indices:
        raise HTTPException(
            status_code=404,
            detail=f"Movie '{movie_title}' not found."
        )

    idx = indices[movie_title]

    sim_scores = sorted(
        enumerate(cosine_sim[idx]),
        key=lambda x: x[1],
        reverse=True
    )[1:n+1]

    movie_indices = [i[0] for i in sim_scores]

    results = movie_df.iloc[movie_indices][[
        "title",
        "avg_rating",
        "num_ratings",
        "genre_combo",
        "tmdbId",
        "poster_url"
    ]].copy()

    results["sim_score"] = [round(s[1], 4) for s in sim_scores]
    results["avg_rating"] = results["avg_rating"].round(2)

    # Replace all NaN/Inf with None so JSON serializes cleanly
    results = results.replace({np.nan: None, np.inf: None, -np.inf: None})

    return {
        "query": movie_title,
        "recommendations": results.to_dict(orient="records")
    }
