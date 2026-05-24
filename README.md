# 🎬 CineMatch — Movie Recommender

A content-based movie recommender built with cosine similarity and TF-IDF.
Search or browse a movie you've watched and get 10 personalized recommendations with posters.

**[Live Demo](https://movie-recommender-mu-six.vercel.app/)** | **[GitHub](https://github.com/philipkim08)**

## Tech Stack
- **Backend:** Python, FastAPI, scikit-learn, pandas
- **Frontend:** React, Vite
- **Data:** MovieLens dataset + TMDB API for posters
- **Deployed:** Render (backend) + Vercel (frontend)

## How It Works
1. Movies are vectorized using TF-IDF on genre and tag features
2. Cosine similarity computes pairwise similarity across all movies
3. On selection, top 10 most similar movies are returned and displayed

## Run Locally
### Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

### Frontend
cd frontend
npm install
npm run dev
