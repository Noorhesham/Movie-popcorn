import { useEffect, useRef, useState } from "react";
import Starrating from "./Starrating";
import { useMovies } from "./useMovies.js";
import { useLocalStorage } from "./useLocalStorage.js";
import { useKey } from "./useKey.js";

const KEY = "a9406199";
export default function App() {
  const [query, setQuery] = useState("");
  const [selectedid, setselectedid] = useState(null);
  const { movies, isLoading, err } = useMovies(query);

  const [watched,setWatched]=useLocalStorage([],'watched')
  function handleSelect(id) {
    setselectedid((selectedid) => (id === selectedid ? null : id));
    console.log(selectedid);
  }
  function handleclose() {
    setselectedid(null);
  }
  function handleAddWatched(movie) {
    watched.map((w) => {
      if (w.imdbID === movie.imdbID) return;
    });
    setWatched((watched) => [...watched, movie]);
  }
  function handledelete(id) {
    setWatched(watched.filter((movie) => movie.imdbID !== id));
  }


  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <Results movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading ? (
            <Loader />
          ) : err ? (
            <ErrorMessage msg={err} />
          ) : (
            <Movielist movies={movies} onSelect={handleSelect} />
          )}
        </Box>
        <Box>
          {selectedid ? (
            <MovieDetails
              watched={watched}
              selectedid={selectedid}
              onAddWatched={handleAddWatched}
              onClose={handleclose}
            />
          ) : (
            <>
              <Watchedsummary watched={watched} />
              <WatchedMovielist
                Ondelete={handledelete}
                watched={watched}
                onSelect={handleSelect}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function Loader() {
  return <p className="loader">Loading...</p>;
}
function ErrorMessage({ msg }) {
  return (
    <p className="error">
      <span>😥</span>
      {msg}
    </p>
  );
}
function NavBar({ children }) {
  return (
    <>
      <nav className="nav-bar">{children}</nav>
    </>
  );
}
function Logo() {
  return (
    <>
      <div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
      </div>
    </>
  );
}
function Search({ query, setQuery }) {
  const inputEl = useRef(null);
  useKey('Enter',function(){        
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");})

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      ref={inputEl}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
function Results({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function Movielist({ movies, onSelect, onAddWatched }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie onSelect={onSelect} movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}
function Movie({ movie, onSelect }) {
  return (
    <li key={movie.imdbID} onClick={() => onSelect(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}
function MovieDetails({ selectedid, onClose, onAddWatched, watched }) {
  const [movie, setmovie] = useState({});
  const [rating, setrating] = useState("");
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;
  const iswatched = watched.map((movie) => movie.imdbID).includes(selectedid);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedid
  )?.rating;
  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedid,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ")[0]),
      rating,
    };
    onAddWatched(newWatchedMovie);
    onClose();
  }
  useKey("Escape",onClose)
  useEffect(
    function () {
      async function getmoviedetails() {
        const res = await fetch(
          `http://www.omdbapi.com/?i=${selectedid}&apikey=${KEY}`
        );
        const data = await res.json();
        setmovie(data);
      }
      getmoviedetails();
    },
    [selectedid]
  );
  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      return function () {
        document.title = "Movie Popcorn";
      };
    },
    [title]
  );
  return (
    <div className="details">
      <header>
        <button className="btn-back" onClick={onClose}>
          &larr;
        </button>
        <img src={poster} alt={`poster of  ${movie} movie`} />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>
            {released} &bull; {runtime}
          </p>
          <p>{genre}</p>
          <p>
            <span>⭐</span>
            {imdbRating}
          </p>
        </div>
      </header>
      <section>
        <div className="rating">
          {!iswatched ? (
            <>
              <Starrating MaxRating={10} size={24} OnSetRating={setrating} />
              {rating > 0 ? (
                <button className="btn-add" onClick={handleAdd}>
                  + add to watchlist
                </button>
              ) : (
                ""
              )}
            </>
          ) : (
            <Starrating
              MaxRating={10}
              size={24}
              defaultRating={watchedUserRating}
              change={false}
            />
          )}
        </div>
        <p>
          <em>{plot}</em>
        </p>
        <p>Starring {actors}</p>
        <p>Directed by {director}</p>
      </section>
    </div>
  );
}
function Watchedsummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.rating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMovielist({ watched, onSelect, Ondelete }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          Ondelete={Ondelete}
          onSelect={onSelect}
          movie={movie}
          key={movie.imdbID}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onSelect, Ondelete }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3 onClick={() => onSelect(movie.imdbID)}>{movie.title}</h3>
      <div>
        <span>⭐️</span>
        <span>{movie.imdbRating}</span>
        <p>
          <span>🌟</span>
          <span>{movie.rating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={() => Ondelete(movie.imdbID)}>
          X
        </button>
      </div>
    </li>
  );
}
