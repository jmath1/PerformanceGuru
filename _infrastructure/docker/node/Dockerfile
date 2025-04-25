FROM ubuntu:22.04

WORKDIR /app
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    curl \
    python3 \
    python3-pip \
    python3-venv \
    && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install
RUN python3 -m venv /app/venv && \
    /app/venv/bin/pip install locust==2.15.1
ENV PATH="/app/venv/bin:$PATH"
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]