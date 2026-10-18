ARG BASE_IMAGE="ghcr.io/blue-build/base-images/fedora-kinoite-nvidia-open:latest"

FROM scratch AS context
COPY build_files /build_files
COPY system_files /system_files

FROM ${BASE_IMAGE}

LABEL org.opencontainers.image.title="ArcadeLite OS" \
      org.opencontainers.image.description="Lightweight Fedora Atomic gaming desktop for AMD Ryzen laptops with NVIDIA graphics" \
      org.opencontainers.image.licenses="Apache-2.0"

RUN --mount=type=bind,from=context,source=/,target=/ctx \
    --mount=type=cache,dst=/var/cache \
    --mount=type=cache,dst=/var/log \
    --mount=type=tmpfs,dst=/tmp \
    /ctx/build_files/build.sh

RUN bootc container lint
