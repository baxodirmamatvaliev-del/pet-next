# PetNest frontend deployment

## Required build variables

- `NEXT_PUBLIC_API_URL` 
- `NEXT_PUBLIC_API_GRAPHQL_URL`
- `NEXT_PUBLIC_API_SOCKET_URL`

All three values must use the public HTTPS backend domain.

## Docker

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.your-domain.com \
  --build-arg NEXT_PUBLIC_API_GRAPHQL_URL=https://api.your-domain.com/graphql \
  --build-arg NEXT_PUBLIC_API_SOCKET_URL=https://api.your-domain.com \
  -t pet-next .

docker run --name pet-next -p 3000:3000 pet-next
```

Check the application at `http://localhost:3000`.
