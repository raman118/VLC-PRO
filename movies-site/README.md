# VLC-PRO Movies

The custom movie discovery site included with VLC-PRO. It is a static site with no build step. TMDB supplies movie metadata and posters; trailers play through YouTube embeds. The Public Domain row links to Internet Archive copies of classic films.

## Configure TMDB

1. Create an API key in your TMDB account.
2. Copy `config.example.json` to `config.json` and put the key in `tmdbApiKey`.
3. `config.json` is ignored by Git. A static browser app exposes its API key to visitors, so use a key intended for browser access and set any available usage restrictions. Never commit the populated config file.

The site works without the key; the archive film row remains available. Movie metadata and search need the key.

## Run locally

From this directory, start any static HTTP server, for example:

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000>. Opening `index.html` as a file may prevent the browser from reading `config.json`.

## Deploy

- **Netlify:** import the repository, set the publish directory to `movies-site`, and upload `config.json` as a deploy file outside Git.
- **Vercel:** configure `movies-site` as the project root and upload `config.json` with the deployment.
- **GitHub Pages:** publish the `movies-site` folder using a Pages workflow that creates `config.json` from a repository Actions secret. The generated file is public in the deployed site.

After deploying the site, set VLC-PRO's `qt-movies-url` preference to its address if you want to open it from the player.
