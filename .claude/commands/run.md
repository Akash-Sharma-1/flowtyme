# /run — Start FlowTyme dev servers

Check MongoDB is running, then start server (port 3001) and client (port 5173).

## Steps

1. Check MongoDB:
```bash
pgrep -x mongod > /dev/null && echo "MongoDB running" || echo "MongoDB NOT running — start with: brew services start mongodb-community"
```

2. Check server/.env exists:
```bash
test -f server/.env && echo ".env found" || echo "MISSING server/.env — copy from .env.example and fill credentials"
```

3. Start server in background:
```bash
cd server && npm run dev &
sleep 3
curl -s http://localhost:3001/api/health
```

4. Start client:
```bash
cd client && npm run dev
```

Report any errors. If MongoDB not running, tell user to start it first. If .env missing, tell user to copy .env.example.
