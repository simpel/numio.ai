# Stage 1: Build pgvector
FROM postgres:latest AS builder

# Install build dependencies
RUN apt-get update && \
    apt-get install -y \
    build-essential \
    git \
    postgresql-server-dev-all && \
    rm -rf /var/lib/apt/lists/*

# Clone and build pgvector
RUN cd /tmp && \
    git clone --branch v0.8.0 https://github.com/pgvector/pgvector.git && \
    cd pgvector && \
    make && \
    make install

# Stage 2: Create final image
FROM postgres:latest

# Copy pgvector extension from builder
COPY --from=builder /usr/lib/postgresql /usr/lib/postgresql
COPY --from=builder /usr/share/postgresql /usr/share/postgresql