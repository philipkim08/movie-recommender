import { useState, useEffect, useRef, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const RED = "#E50914";
const FALLBACK_POSTER = "https://via.placeholder.com/300x450/1a1a2e/E50914?text=No+Poster";

// ── Helpers ───────────────────────────────────────────────────────────────────
function StarRating({ rating }) {
  const stars = Math.round((rating / 5) * 5);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= stars ? RED : "#444", fontSize: "12px" }}>★</span>
      ))}
      <span style={{ color: "#aaa", fontSize: "12px", marginLeft: "4px" }}>
        {rating ? rating.toFixed(1) : "N/A"}
      </span>
    </div>
  );
}

function GenrePills({ genres }) {
  if (!genres) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
      {genres.split(",").slice(0, 3).map((g) => (
        <span key={g} style={{
          background: "rgba(229,9,20,0.15)",
          border: "1px solid rgba(229,9,20,0.4)",
          color: RED,
          borderRadius: "20px",
          padding: "2px 10px",
          fontSize: "11px",
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: "0.5px",
        }}>
          {g.trim()}
        </span>
      ))}
    </div>
  );
}

// ── Carousel ──────────────────────────────────────────────────────────────────
function Carousel({ movies }) {
  const [current, setCurrent] = useState(0);
  const [animDir, setAnimDir] = useState(null);
  const [visible, setVisible] = useState(true);

  const go = useCallback((dir) => {
    setVisible(false);
    setAnimDir(dir);
    setTimeout(() => {
      setCurrent((prev) =>
        dir === "next" ? (prev + 1) % movies.length : (prev - 1 + movies.length) % movies.length
      );
      setVisible(true);
    }, 250);
  }, [movies.length]);

  useEffect(() => { setCurrent(0); setVisible(true); }, [movies]);

  if (!movies.length) return null;
  const movie = movies[current];

  return (
    <div style={{ width: "100%", marginBottom: "60px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <div style={{ width: "4px", height: "28px", background: RED, borderRadius: "2px" }} />
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", color: "#fff", letterSpacing: "2px", margin: 0 }}>
          TOP PICK
        </h2>
        <span style={{ fontFamily: "'DM Sans', sans-serif", color: "#666", fontSize: "14px" }}>
          {current + 1} / {movies.length}
        </span>
      </div>

      <div style={{
        position: "relative", borderRadius: "16px", overflow: "hidden",
        background: "#0d0d0d", border: "1px solid #222", display: "flex",
        minHeight: "380px", boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
      }}>
        {/* Poster */}
        <div style={{
          width: "260px", minWidth: "260px", position: "relative", overflow: "hidden",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0)" : animDir === "next" ? "translateX(-30px)" : "translateX(30px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}>
          <img
            src={movie.poster_url || FALLBACK_POSTER}
            alt={movie.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={(e) => { e.target.src = FALLBACK_POSTER; }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, #0d0d0d 100%)" }} />
        </div>

        {/* Info */}
        <div style={{
          flex: 1, padding: "40px 48px", display: "flex", flexDirection: "column", justifyContent: "center",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0)" : animDir === "next" ? "translateX(20px)" : "translateX(-20px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", letterSpacing: "3px", color: RED, textTransform: "uppercase", marginBottom: "12px" }}>
            Recommended #{current + 1}
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px, 4vw, 52px)", color: "#fff", margin: "0 0 16px 0", lineHeight: 1.1, letterSpacing: "1px" }}>
            {movie.title}
          </h1>
          <StarRating rating={movie.avg_rating} />
          <GenrePills genres={movie.genre_combo} />
          {movie.num_ratings && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#555", fontSize: "12px", marginTop: "12px" }}>
              {movie.num_ratings.toLocaleString()} ratings
            </p>
          )}
          <div style={{
            marginTop: "24px", display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(229,9,20,0.1)", border: "1px solid rgba(229,9,20,0.3)",
            borderRadius: "8px", padding: "8px 16px", width: "fit-content",
          }}>
            <span style={{ color: RED, fontSize: "12px", fontFamily: "'DM Sans', sans-serif" }}>Match score</span>
            <span style={{ color: "#fff", fontSize: "14px", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "1px" }}>
              {movie.sim_score ? `${(movie.sim_score * 100).toFixed(0)}%` : "—"}
            </span>
          </div>
        </div>

        {/* Nav arrows */}
        {[{ dir: "prev", side: "left", symbol: "‹" }, { dir: "next", side: "right", symbol: "›" }].map(({ dir, side, symbol }) => (
          <button
            key={dir}
            onClick={() => go(dir)}
            style={{
              position: "absolute", top: "50%", [side]: "16px", transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.7)", border: "1px solid #333", borderRadius: "50%",
              width: "44px", height: "44px", color: "#fff", fontSize: "24px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s, border-color 0.2s", zIndex: 10, lineHeight: 1,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = RED; e.currentTarget.style.borderColor = RED; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.7)"; e.currentTarget.style.borderColor = "#333"; }}
          >
            {symbol}
          </button>
        ))}

        {/* Dot indicators */}
        <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "6px" }}>
          {movies.map((_, i) => (
            <div
              key={i}
              onClick={() => {
                setAnimDir(i > current ? "next" : "prev");
                setVisible(false);
                setTimeout(() => { setCurrent(i); setVisible(true); }, 250);
              }}
              style={{
                width: i === current ? "20px" : "6px", height: "6px", borderRadius: "3px",
                background: i === current ? RED : "#444", cursor: "pointer", transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Movie Card ────────────────────────────────────────────────────────────────
function MovieCard({ movie, rank }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#0d0d0d",
        border: `1px solid ${hovered ? RED : "#1e1e1e"}`,
        borderRadius: "12px", overflow: "hidden",
        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "0 20px 40px rgba(229,9,20,0.15)" : "0 4px 12px rgba(0,0,0,0.3)",
        cursor: "pointer", position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: "10px", left: "10px", background: RED, color: "#fff", fontFamily: "'Bebas Neue', sans-serif", fontSize: "14px", letterSpacing: "1px", borderRadius: "6px", padding: "2px 8px", zIndex: 2 }}>
        #{rank}
      </div>
      <div style={{ position: "relative", paddingBottom: "150%", overflow: "hidden" }}>
        <img
          src={movie.poster_url || FALLBACK_POSTER}
          alt={movie.title}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease", transform: hovered ? "scale(1.05)" : "scale(1)" }}
          onError={(e) => { e.target.src = FALLBACK_POSTER; }}
        />
        {movie.sim_score && (
          <div style={{ position: "absolute", bottom: "8px", right: "8px", background: "rgba(0,0,0,0.8)", border: `1px solid ${RED}`, borderRadius: "6px", padding: "2px 8px", color: RED, fontFamily: "'Bebas Neue', sans-serif", fontSize: "13px", letterSpacing: "1px" }}>
            {(movie.sim_score * 100).toFixed(0)}% match
          </div>
        )}
      </div>
      <div style={{ padding: "14px" }}>
        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", color: "#fff", margin: "0 0 8px 0", letterSpacing: "0.5px", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {movie.title}
        </h3>
        <StarRating rating={movie.avg_rating} />
        <GenrePills genres={movie.genre_combo} />
      </div>
    </div>
  );
}

// ── Search Bar ────────────────────────────────────────────────────────────────
function SearchBar({ movies, onSelect }) {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (query.length < 2) { setFiltered([]); setOpen(false); return; }
    const q = query.toLowerCase();
    const results = movies.filter((m) => m.title.toLowerCase().includes(q)).slice(0, 8);
    setFiltered(results);
    setOpen(results.length > 0);
  }, [query, movies]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (movie) => { setQuery(movie.title); setOpen(false); onSelect(movie); };

  return (
    // position:relative + high zIndex on the wrapper ensures dropdown floats above everything
    <div ref={ref} style={{ position: "relative", width: "100%", zIndex: 1000 }}>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)", color: "#555", fontSize: "18px", pointerEvents: "none" }}>⌕</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && filtered.length > 0 && setOpen(true)}
          placeholder="Search a movie you've watched..."
          style={{
            width: "100%", padding: "16px 16px 16px 48px",
            background: "#111", border: "1px solid #2a2a2a", borderRadius: "12px",
            color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: "15px",
            outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
          }}
          onFocus={(e) => { e.target.style.borderColor = RED; if (query.length >= 2 && filtered.length > 0) setOpen(true); }}
          onBlur={(e) => { e.target.style.borderColor = "#2a2a2a"; }}
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); }} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "18px" }}>×</button>
        )}
      </div>

      {/* Dropdown — rendered at top of stacking context via zIndex */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
          background: "#151515", border: "1px solid #333", borderRadius: "12px",
          overflow: "hidden", zIndex: 9999,
          boxShadow: "0 24px 48px rgba(0,0,0,0.9)",
        }}>
          {filtered.map((m, i) => (
            <div
              key={m.movieId}
              onClick={() => handleSelect(m)}
              style={{
                display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px",
                cursor: "pointer", borderBottom: i < filtered.length - 1 ? "1px solid #1a1a1a" : "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#1e1e1e"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <img src={m.poster_url || FALLBACK_POSTER} alt={m.title} style={{ width: "32px", height: "48px", objectFit: "cover", borderRadius: "4px" }} onError={(e) => { e.target.src = FALLBACK_POSTER; }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", color: "#ddd", fontSize: "14px" }}>{m.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Browse Row ────────────────────────────────────────────────────────────────
function BrowseRow({ movies, onSelect }) {
  const scrollRef = useRef(null);
  const scroll = (dir) => scrollRef.current.scrollBy({ left: dir * 220, behavior: "smooth" });

  return (
    <div style={{ marginBottom: "60px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div style={{ width: "4px", height: "28px", background: RED, borderRadius: "2px" }} />
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", color: "#fff", letterSpacing: "2px", margin: 0 }}>
          BROWSE ALL MOVIES
        </h2>
      </div>
      <div style={{ position: "relative" }}>
        {["left", "right"].map((side) => (
          <button key={side} onClick={() => scroll(side === "right" ? 1 : -1)} style={{
            position: "absolute", [side]: 0, top: "50%", transform: "translateY(-50%)", zIndex: 10,
            background: `linear-gradient(to ${side === "left" ? "right" : "left"}, #0a0a0a 40%, transparent)`,
            border: "none", color: "#fff", fontSize: "28px", cursor: "pointer", padding: "40px 12px", height: "100%",
          }}>
            {side === "left" ? "‹" : "›"}
          </button>
        ))}
        <div ref={scrollRef} style={{ display: "flex", gap: "12px", overflowX: "auto", scrollbarWidth: "none", padding: "8px 40px" }}>
          {movies.map((m) => (
            <div key={m.movieId} onClick={() => onSelect(m)} style={{ minWidth: "120px", cursor: "pointer", transition: "transform 0.2s", flexShrink: 0 }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <img src={m.poster_url || FALLBACK_POSTER} alt={m.title} style={{ width: "120px", height: "180px", objectFit: "cover", borderRadius: "8px", display: "block" }} onError={(e) => { e.target.src = FALLBACK_POSTER; }} />
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#888", margin: "6px 0 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "120px" }}>
                {m.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [allMovies, setAllMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/movies`)
      .then((r) => r.json())
      .then(setAllMovies)
      .catch(() => setError("Could not connect to backend."));
  }, []);

  const handleSelectMovie = async (movie) => {
    setSelectedMovie(movie);
    setLoading(true);
    setError(null);
    setRecommendations([]);
    try {
      const encoded = encodeURIComponent(movie.title);
      const res = await fetch(`${API_URL}/recommend/${encoded}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setRecommendations(data.recommendations);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setError("Could not fetch recommendations. Try another movie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
        body { background: #0a0a0a; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Hero Header — overflow:visible so dropdown escapes */}
      <div style={{
        background: "linear-gradient(to bottom, #1a0a0f 0%, #0a0a0a 100%)",
        borderBottom: "1px solid #1a1a1a",
        padding: "40px 60px 50px",
        position: "relative",
        overflow: "visible",
      }}>
        <div style={{ position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "200px", background: "radial-gradient(ellipse, rgba(229,9,20,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
          {/* Logo */}
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "36px", letterSpacing: "6px", color: RED, margin: 0 }}>
              CINEMATCH
            </h1>
            <p style={{ color: "#444", fontSize: "12px", letterSpacing: "2px", marginTop: "4px" }}>
              POWERED BY COSINE SIMILARITY
            </p>
            <a
              href="https://github.com/philipkim08"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#555", fontSize: "12px", letterSpacing: "2px", textDecoration: "none", display: "inline-block", marginTop: "4px", transition: "color 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = RED}
              onMouseLeave={(e) => e.currentTarget.style.color = "#555"}
            >
              GITHUB — PHILIPKIM08
            </a>
          </div>

          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px, 6vw, 72px)", lineHeight: 1, letterSpacing: "2px", marginBottom: "12px", textAlign: "center" }}>
            WHAT DID YOU<br /><span style={{ color: RED }}>WATCH LAST?</span>
          </h2>
          <p style={{ color: "#666", fontSize: "15px", marginBottom: "32px", textAlign: "center", whiteSpace: "nowrap" }}>
            Search or browse a movie you've seen. We'll find your next 10 must-watches.
          </p>

          <SearchBar movies={allMovies} onSelect={handleSelectMovie} />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 60px" }}>
        {allMovies.length > 0 && <BrowseRow movies={allMovies} onSelect={handleSelectMovie} />}

        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ width: "48px", height: "48px", border: "3px solid #1a1a1a", borderTop: `3px solid ${RED}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: "#555" }}>Finding recommendations for <strong style={{ color: RED }}>{selectedMovie?.title}</strong>...</p>
          </div>
        )}

        {error && (
          <div style={{ background: "rgba(229,9,20,0.1)", border: "1px solid rgba(229,9,20,0.3)", borderRadius: "12px", padding: "20px 24px", color: RED }}>
            {error}
          </div>
        )}

        {recommendations.length > 0 && (
          <div ref={resultsRef}>
            {/* Because you watched banner */}
            <div style={{ marginBottom: "40px", padding: "20px 24px", background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: "12px", display: "flex", alignItems: "center", gap: "16px" }}>
              <img src={selectedMovie?.poster_url || FALLBACK_POSTER} alt={selectedMovie?.title} style={{ width: "48px", height: "72px", objectFit: "cover", borderRadius: "6px" }} onError={(e) => { e.target.src = FALLBACK_POSTER; }} />
              <div>
                <p style={{ color: "#555", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase" }}>Because you watched</p>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px", letterSpacing: "1px", color: "#fff" }}>{selectedMovie?.title}</h3>
              </div>
            </div>

            <Carousel movies={recommendations} />

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ width: "4px", height: "28px", background: RED, borderRadius: "2px" }} />
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", color: "#fff", letterSpacing: "2px", margin: 0 }}>ALL RECOMMENDATIONS</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "20px" }}>
              {recommendations.map((m, i) => <MovieCard key={m.title} movie={m} rank={i + 1} />)}
            </div>
          </div>
        )}

        {!loading && !recommendations.length && !error && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎬</div>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px", letterSpacing: "2px", color: "#2a2a2a" }}>
              SEARCH OR CLICK A MOVIE ABOVE TO GET STARTED
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
