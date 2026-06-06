# todo-front

React frontend for `TK.Tasks`.

## Environment

Create local env file from example:

```bash
cp .env.example .env
```

Default backend API URL:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

For production builds, set `VITE_API_URL` before building because Vite embeds env variables at build time:

```bash
VITE_API_URL=https://api.example.com/api/v1 npm run build
```

## Run

```bash
npm install
npm run dev
```

Vite dev server is usually available at:

```txt
http://localhost:5173
```

## Build

```bash
npm run build
```
