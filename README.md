# ArcadeLite OS

ArcadeLite OS is a buildable Fedora Atomic desktop image for gaming laptops
with an AMD Ryzen 7 7445HS and a supported NVIDIA GPU. It uses KDE Plasma on
Wayland, keeps game stores out of the immutable host, and provides image-based
updates with rollback.

This repository is OS source, not a prebuilt ISO. The included GitHub Actions
workflows build signed OCI system images and a downloadable Anaconda installer
ISO. The current host is Windows without Podman, Docker, WSL, or KVM, so the
image can be statically verified here but must be built and boot-tested on the
Linux CI runner or a Linux workstation.

## Hardware targets

- CPU: AMD Ryzen 7 7445HS (Phoenix, 6 cores / 12 threads, Radeon 740M iGPU).
- Preferred GPU image (`open`): GeForce GTX 16-series and all RTX cards. This
  uses NVIDIA's open kernel module through the BlueBuild Kinoite base.
- Compatibility image (`legacy`): older supported NVIDIA cards that still need
  the proprietary kernel module.
- Firmware: UEFI. Secure Boot works only after enrolling the base image's
  machine-owner key; see [INSTALL.md](docs/INSTALL.md).
- Recommended RAM: 8 GiB minimum, 16 GiB or more for modern games.

The CPU model is real and is not a typo: AMD lists it as Zen 4/Zen 4c with a
35 W default TDP and Radeon 740M graphics. ArcadeLite does not hard-code CPU
model checks, so it remains usable on other modern x86-64 Ryzen/NVIDIA laptops.

## What is included

- Fedora 44 Kinoite-derived atomic host and KDE Plasma Wayland.
- NVIDIA driver variants with `nvidia_drm.modeset=1` and laptop runtime power
  management.
- GameMode, gamescope, MangoHud, GOverlay, Vulkan tools, and game-controller
  rules on the host.
- One-click per-user installation of Steam, Heroic, and Lutris from Flathub.
- `arcadelite-game`, a safe GameMode/PRIME wrapper for hybrid graphics.
- ZRAM and a moderate VM policy for better behavior under memory pressure.
- Disabled file-content indexing by default, shorter animations, a branded
  wallpaper, a first-run setup menu, and a diagnostic report.

## Build and test

Local builds require a recent Linux system with rootful Podman:

```bash
sudo podman build \
  --build-arg BASE_IMAGE=ghcr.io/blue-build/base-images/fedora-kinoite-nvidia-open:latest \
  -t arcadelite-os:latest .
sudo podman run --rm arcadelite-os:latest bootc container lint
node tests/verify-project.mjs all
```

For the supported hosted route, create a GitHub repository from this source,
enable Actions, and run **Build bootc images**. Make both resulting GHCR
packages public so installed systems can retrieve updates, then run **Build
installer ISO**. The ISO is retained as a workflow artifact for 14 days. Builds
keyless-sign immutable image digests with Sigstore.

## Daily use

Open **ArcadeLite Setup** from the application menu to install game stores or
read the local quick-start guide. For standalone games:

```bash
arcadelite-game --nvidia --hud -- /path/to/game
arcadelite-game --integrated -- /path/to/light-game
```

Measure idle memory after a clean reboot rather than relying on a marketing
number:

```bash
systemd-analyze
free -h
systemd-cgtop --iterations=1
arcadelite-system-report
```

The design target is a quiet desktop that normally remains near or below
1.5 GiB of used memory after login on reference hardware. That is a target,
not a guarantee: GPU drivers, firmware, display count, Plasma version, and
user autostart applications all change the result. See
[PERFORMANCE.md](docs/PERFORMANCE.md) for the test protocol.

## Safety and recovery

ArcadeLite never applies GPU overclocks, disables thermal controls, or forces a
permanent performance governor. GameMode's changes are temporary. Before an
update, the previous bootc deployment remains available from the boot menu.
From a working deployment, `sudo bootc rollback` selects the previous image.
See [INSTALL.md](docs/INSTALL.md) for rollback and recovery instructions.

## Project status

The image definition, system integration, build/ISO workflows, and static
verification are complete. A real ISO build and boot test are still required
on your exact laptop before replacing its current OS. Back up personal data and
test Wi-Fi, audio, suspend/resume, brightness controls, external displays, and
the selected NVIDIA variant from the installer environment first.

## Documentation

- [Architecture and research](docs/ARCHITECTURE.md)
- [Build, install, Secure Boot, and rollback](docs/INSTALL.md)
- [Memory and performance validation](docs/PERFORMANCE.md)
- [Known limitations](docs/LIMITATIONS.md)

ArcadeLite OS is an independent project and is not affiliated with Fedora,
NVIDIA, AMD, Valve, KDE, Universal Blue, or BlueBuild.
