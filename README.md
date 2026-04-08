
## Env

Use `.env.local` for local secrets.

Frontend:
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

Server only:
- `GOOGLE_CLIENT_SECRET`

If Google login is resolved through the backend endpoint, the secret should stay in the backend environment and never be exposed to the browser.
