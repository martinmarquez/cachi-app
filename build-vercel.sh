#!/bin/bash
set -e

# 1. Build static Expo app
npx expo export --platform web

# 2. Set up Vercel Build Output API v3
rm -rf .vercel/output
mkdir -p .vercel/output/static
mkdir -p .vercel/output/functions/api/auth-proxy.func

# 3. Copy static files
cp -r dist/* .vercel/output/static/

# 4. Copy the serverless function
cp api/auth-proxy.js .vercel/output/functions/api/auth-proxy.func/index.js

# 5. Function config
cat > .vercel/output/functions/api/auth-proxy.func/.vc-config.json << 'EOF'
{
  "runtime": "nodejs20.x",
  "handler": "index.js",
  "launcherType": "Nodejs"
}
EOF

# 6. Routing config
cat > .vercel/output/config.json << 'EOF'
{
  "version": 3,
  "routes": [
    { "src": "/api/auth/(.*)", "dest": "/api/auth-proxy?path=$1" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
EOF

echo "Build complete — static files + auth-proxy function ready"
