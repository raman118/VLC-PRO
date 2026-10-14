const API_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/";
const archiveFilms = [
  { title: "Night of the Living Dead", year: "1968", archiveId: "night_of_the_living_dead", note: "George A. Romero's influential independent horror classic." },
  { title: "His Girl Friday", year: "1940", archiveId: "His_Girl_Friday", note: "A fast-paced newsroom comedy starring Cary Grant and Rosalind Russell." },
  { title: "The General", year: "1926", archiveId: "The_General", note: "Buster Keaton's silent comedy adventure." },
  { title: "Charade", year: "1963", archiveId: "Charade_1963", note: "A mystery thriller starring Audrey Hepburn and Cary Grant." },
  { title: "Plan 9 from Outer Space", year: "1957", archiveId: "Plan_9_from_Outer_Space", note: "Ed Wood's cult science fiction film." },
  { title: "The Little Shop of Horrors", year: "1960", archiveId: "The_Little_Shop_of_Horrors", note: "Roger Corman's original black comedy horror film." }
];

const $ = (selector) => document.querySelector(selector);
const apiKey = await loadApiKey();
const notice = $("#notice");
let currentMovies = [];
let searchTimer;

async function loadApiKey() {
  try {
    const response = await fetch("./config.js", { cache: "no-store" });
    if (!response.ok) return "";
    const config = await response.json();
    return typeof config.tmdbApiKey === "string" ? config.tmdbApiKey.trim() : "";
  } catch {
    return "";
  }
}

function showNotice(message) {
  notice.textContent = message;
  notice.hidden = false;
}

async function tmdb(path, params = {}) {
  if (!apiKey) throw new Error("Add your TMDB API key in config.js to load movie metadata.");
  const url = new URL(`${API_BASE}${path}`);
  url.search = new URLSearchParams({ api_key: apiKey, language: "en-US", ...params });
  const response = await fetch(url);
  if (!response.ok) throw new Error(`TMDB request failed (${response.status}).`);
  return response.json();
}

function posterUrl(path, size = "w500") {
  return path ? `${IMAGE_BASE}${size}${path}` : "";
}

function renderMovieRows(target, movies) {
  target.replaceChildren();
  if (!movies.length) {
    target.innerHTML = '<p class="loading">No movies found.</p>';
    return;
  }
  movies.forEach((movie) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "movie-card";
    card.setAttribute("aria-label", `More information about ${movie.title}`);
    const image = document.createElement("img");
    image.loading = "lazy";
    image.alt = `${movie.title} poster`;
    image.src = posterUrl(movie.poster_path);
    image.onerror = () => { image.hidden = true; };
    const fade = document.createElement("span");
    fade.className = "card-fade";
    const title = document.createElement("strong");
    title.textContent = movie.title;
    const year = document.createElement("small");
    year.textContent = (movie.release_date || "").slice(0, 4);
    const play = document.createElement("span");
    play.className = "play-dot";
    play.setAttribute("aria-hidden", "true");
    play.textContent = "▶";
    fade.append(title, year);
    card.append(image, fade, play);
    card.addEventListener("click", () => openMovie(movie));
    target.append(card);
  });
}

function renderArchive() {
  const row = $("#archive-row");
  archiveFilms.forEach((film) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "movie-card archive-card";
    card.setAttribute("aria-label", `Details and public domain film: ${film.title}`);
    const art = document.createElement("span");
    art.className = "archive-art";
    const title = document.createElement("b");
    title.textContent = film.title;
    art.append(title);
    const fade = document.createElement("span");
    fade.className = "card-fade";
    const label = document.createElement("strong");
    label.textContent = film.title;
    const year = document.createElement("small");
    year.textContent = `${film.year} · Public domain`;
    fade.append(label, year);
    card.append(art, fade);
    card.addEventListener("click", () => openArchiveFilm(film));
    row.append(card);
  });
}

async function loadCatalogue() {
  renderArchive();
  if (!apiKey) {
    showNotice("Add a TMDB API key to movies-site/config.js to load Trending, Popular, Top Rated, and search results. Public domain films are ready to browse.");
    document.querySelectorAll(".movie-row .loading").forEach((item) => { item.textContent = "Add your TMDB key in config.js to load this row."; });
    return;
  }
  const requests = [
    ["#trending-row", "/trending/movie/week", true],
    ["#popular-row", "/movie/popular", false],
    ["#top-rated-row", "/movie/top_rated", false]
  ];
  const results = await Promise.allSettled(requests.map(async ([selector, path, trending]) => {
    const data = await tmdb(path);
    const movies = data.results || [];
    renderMovieRows($(selector), movies);
    if (trending && movies[0]) {
      currentMovies = movies;
      setHero(movies[0]);
    }
  }));
  if (results.some((result) => result.status === "rejected")) {
    const failure = results.find((result) => result.status === "rejected");
    showNotice(failure.reason.message || "Could not load movies from TMDB.");
  }
}

function setHero(movie) {
  $("#hero-title").textContent = movie.title;
  $("#hero-copy").textContent = movie.overview || "Explore movies and watch a trailer.";
  const backdrop = posterUrl(movie.backdrop_path, "w1280");
  if (backdrop) $(".hero").style.backgroundImage = `url("${backdrop}")`;
  $("#hero-details").onclick = () => openMovie(movie);
}

async function openMovie(movie) {
  const dialog = $("#details");
  $("#details-title").textContent = movie.title;
  $("#modal-kicker").textContent = "TMDB MOVIE";
  $("#modal-meta").textContent = `${(movie.release_date || "").slice(0, 4)}${movie.vote_average ? ` · ★ ${movie.vote_average.toFixed(1)}` : ""}`;
  $("#modal-overview").textContent = movie.overview || "No description is available.";
  $("#player-wrap").innerHTML = '<div class="player-placeholder">Choose a trailer to play</div>';
  $("#archive-link").hidden = true;
  $("#trailer-button").hidden = false;
  $("#trailer-button").onclick = async () => {
    try {
      const videos = await tmdb(`/movie/${movie.id}/videos`);
      const trailer = (videos.results || []).find((video) => video.site === "YouTube" && video.type === "Trailer" && video.official)
        || (videos.results || []).find((video) => video.site === "YouTube" && video.type === "Trailer");
      if (!trailer) throw new Error("No YouTube trailer is available for this movie.");
      showYoutubeTrailer(trailer.key);
    } catch (error) {
      $("#player-wrap").innerHTML = `<div class="player-placeholder">${escapeHtml(error.message)}</div>`;
    }
  };
  dialog.showModal();
}

function showYoutubeTrailer(key) {
  const frame = document.createElement("iframe");
  frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(key)}?autoplay=1&rel=0`;
  frame.title = "Movie trailer on YouTube";
  frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  frame.allowFullscreen = true;
  $("#player-wrap").replaceChildren(frame);
}

function openArchiveFilm(film) {
  const dialog = $("#details");
  $("#details-title").textContent = film.title;
  $("#modal-kicker").textContent = "PUBLIC DOMAIN FILM";
  $("#modal-meta").textContent = `${film.year} · Internet Archive`;
  $("#modal-overview").textContent = film.note;
  $("#player-wrap").innerHTML = '<div class="player-placeholder">Select “Watch full film” to play from Internet Archive.</div>';
  $("#trailer-button").hidden = true;
  const link = $("#archive-link");
  link.href = `https://archive.org/details/${encodeURIComponent(film.archiveId)}`;
  link.hidden = false;
  link.onclick = (event) => {
    event.preventDefault();
    const frame = document.createElement("iframe");
    frame.src = `https://archive.org/embed/${encodeURIComponent(film.archiveId)}`;
    frame.title = `${film.title} at Internet Archive`;
    frame.allow = "autoplay; fullscreen";
    frame.allowFullscreen = true;
    $("#player-wrap").replaceChildren(frame);
    link.hidden = true;
  };
  dialog.showModal();
}

async function searchMovies(query) {
  const resultsSection = $("#search-results");
  if (!query.trim()) {
    resultsSection.hidden = true;
    $("#catalogue").hidden = false;
    return;
  }
  resultsSection.hidden = false;
  $("#catalogue").hidden = true;
  if (!apiKey) {
    $("#search-count").textContent = "TMDB key required";
    $("#search-row").replaceChildren();
    return;
  }
  $("#search-count").textContent = "Searching…";
  try {
    const data = await tmdb("/search/movie", { query: query.trim(), include_adult: "false" });
    $("#search-count").textContent = `${data.total_results || 0} found`;
    renderMovieRows($("#search-row"), data.results || []);
  } catch (error) {
    $("#search-count").textContent = "Search unavailable";
    showNotice(error.message);
  }
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

$("#search").addEventListener("input", (event) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => searchMovies(event.target.value), 250);
});
$("#close-modal").addEventListener("click", () => $("#details").close());
$("#details").addEventListener("click", (event) => {
  if (event.target === $("#details")) $("#details").close();
});
$("#details").addEventListener("close", () => {
  $("#player-wrap").replaceChildren();
  $("#trailer-button").hidden = false;
});

await loadCatalogue();
