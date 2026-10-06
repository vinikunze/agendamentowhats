FROM node:22.23.3-bookworm-slim
WORKDIR /app
COPY --chown=node:node backend ./backend
COPY --chown=node:node src/lib/agenda.ts ./src/lib/agenda.ts
RUN mkdir -p /data && chown node:node /data
USER node
ENV NODE_ENV=production PORT=8080 DATABASE_PATH=/data/agenda.sqlite
EXPOSE 8080
CMD ["node", "--experimental-strip-types", "backend/server.mjs"]
