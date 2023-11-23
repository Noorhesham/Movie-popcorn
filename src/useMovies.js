import { useEffect, useState } from "react";
const KEY = "a9406199";

export function useMovies(query,callback){
    const [movies, setMovies] = useState([]);
    const [isLoading, setisLoading] = useState(false);
    const [err, seterr] = useState("");
    useEffect(
        function () {
          const controller = new AbortController();
          async function fetchMovies() {
            try {
              setisLoading(true);
              seterr("");
              const res = await fetch(
                `http://www.omdbapi.com/?i=tt3896198&apikey=${KEY}&s=${query}`,
                { signal: controller.signal }
              );
              if (!res.ok)
                throw new Error(
                  "Something went wrong getting your movies data...!"
                );
              const data = await res.json();
              console.log(data);
              if (data.Response === "False") throw new Error("movie not found ...");
              setMovies(data.Search);
            } catch (err) {
              if (err.name !== "AbortError"){
                console.error(err.message);
                seterr(err.message);
              } 
            } finally {
              setisLoading(false);
            }
          }
          if (!query.length) {
            setMovies([]);
            seterr("");
            return;
          }
          fetchMovies();
          return function () {
            controller.abort();
          };
        },
        [query]
      );
      return {movies,isLoading,err}
}