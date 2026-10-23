FROM node:24-alpine

WORKDIR /app

COPY mvp/package.json ./package.json
COPY mvp/server.mjs ./server.mjs
COPY mvp/public ./public
COPY mvp/data ./data

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5188

EXPOSE 5188

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:5188/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "server.mjs"]
