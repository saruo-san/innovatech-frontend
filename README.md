Frontend (Vite + React)

Instrucciones rápidas:

- Construir localmente:
  - `npm install`
  - `npm run build`
- Levantar con Docker (local):
  - `docker build -t frontend:local .`
  - `docker run -d --name frontend -p 80:8080 frontend:local`

Variables de entorno (en build):
- `VITE_API_URL` (se utiliza en build para fijar la URL del API)

En CI la pipeline pasa `VITE_API_URL` como build-arg al Dockerfile.
