FROM ubuntu:25.04

ARG DEBIAN_FRONTEND=noninteractive
ARG GO_VERSION=1.26.0
ARG NODE_MAJOR=24

# Ensure CI mode
ENV CI=true

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    xz-utils \
    build-essential \
    pkg-config \
    file \
    libwebkitgtk-6.0-dev \
    libgtk-4-dev \
    libsoup-3.0-dev \
    rpm \
    dpkg-dev \
    protobuf-compiler \
    fakeroot \
    desktop-file-utils \
    libfuse2 \
    squashfs-tools \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL "https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz" -o /tmp/go.tgz \
    && rm -rf /usr/local/go \
    && tar -C /usr/local -xzf /tmp/go.tgz \
    && rm -f /tmp/go.tgz

RUN curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash - \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

ENV GOPATH=/go
ENV PATH=/usr/local/go/bin:/go/bin:${PATH}

RUN corepack enable \
    && corepack prepare pnpm@latest --activate \
    && go install github.com/wailsapp/wails/v3/cmd/wails3@latest \
    && go install github.com/go-task/task/v3/cmd/task@latest \
    && go version \
    && node --version \
    && pnpm --version \
    && wails3 version \
    && task --version

USER root
WORKDIR /workspace

CMD ["bash"]
