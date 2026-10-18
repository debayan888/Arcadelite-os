# Architecture and research record

Research was performed on 18 October 2026. Primary project and vendor sources
were preferred for implementation decisions.

## Decision summary

| Area | Choice | Reason |
|---|---|---|
| Base | Fedora 44 Atomic/Kinoite via BlueBuild | Transactional image updates, rollback, current kernel/Mesa, and an existing NVIDIA-integrated base. |
| Desktop | KDE Plasma, Wayland | Familiar desktop UI, configurable behavior, and modern high-refresh/VRR support with modest idle overhead. |
| NVIDIA | Separate `open` and `legacy` images | The open module covers GTX 16-series and RTX; the legacy image preserves broader older-card compatibility. |
| Hybrid graphics | AMD iGPU for desktop; explicit NVIDIA PRIME wrapper for games | Lets the discrete GPU power down when unused and avoids spending power/RAM on an always-active dGPU desktop. |
| Gaming stack | GameMode, gamescope, MangoHud on host; stores in Flatpak | Hardware-facing tools stay native while large fast-changing clients remain isolated and optional. |
| Memory | No content indexing, restrained autostart, ZRAM, swappiness 133 | Reduces idle work while providing compressed headroom without claiming impossible fixed RAM use. |
| Updates | bootc OCI image and Anaconda ISO | One audited system artifact, atomic deployment, and previous-deployment rollback. |

## Hardware findings

AMD's product page confirms the Ryzen 7 7445HS: six cores/twelve threads,
hybrid Zen 4 + Zen 4c CPU architecture, Radeon 740M integrated graphics,
35 W default TDP, and Ubuntu/RHEL x86-64 support. The integrated GPU is useful
as the low-power display GPU on hybrid laptops.

- AMD Ryzen 7 7445HS specifications:
  https://www.amd.com/ja/products/processors/laptop/ryzen/7000-series/amd-ryzen-7-7445hs.html

BlueBuild publishes Fedora 44 Kinoite bases with both NVIDIA and NVIDIA-open
kernel-module variants. It documents that the kernel/module signing key must be
enrolled for Secure Boot. ArcadeLite uses those maintained bases instead of
rebuilding an out-of-tree NVIDIA module independently on every update.

- BlueBuild base images and Secure Boot enrollment:
  https://github.com/blue-build/base-images/blob/main/README.md

NVIDIA documents PRIME render-offload variables for Vulkan and OpenGL. The
`arcadelite-game` wrapper uses exactly those variables, and does not export them
globally, allowing the dGPU to remain idle during ordinary desktop use.

- NVIDIA PRIME render offload:
  https://download.nvidia.com/XFree86/Linux-x86_64/495.44/README/primerenderoffload.html
- NVIDIA notebook and Optimus behavior:
  https://download.nvidia.com/XFree86/Linux-x86_64/550.135/README/optimus.html
- NVIDIA runtime D3 power management:
  https://download.nvidia.com/XFree86/Linux-x86_64/515.86.01/README/dynamicpowermanagement.html

KDE requires a current Plasma/NVIDIA/XWayland stack for a good Wayland
experience. The selected Fedora 44 base exceeds KDE's documented minimums, and
`nvidia_drm.modeset=1` is explicitly configured.

- KDE Plasma Wayland/NVIDIA prerequisites:
  https://community.kde.org/Plasma/Wayland/Nvidia
- KDE gaming overview:
  https://kde.org/for/gamers/

## Gaming and memory findings

Fedora 44 directly packages GameMode, gamescope, MangoHud, and GOverlay.
GameMode applies optimizations only while a requesting game runs, then restores
the prior state. MangoHud can be enabled per launch rather than occupying the
desktop continuously.

- Fedora GameMode package: https://packages.fedoraproject.org/pkgs/gamemode/gamemode/fedora-44.html
- Fedora gamescope package: https://packages.fedoraproject.org/pkgs/gamescope/gamescope/fedora-44.html
- Fedora MangoHud package: https://packages.fedoraproject.org/pkgs/mangohud/mangohud/
- GameMode design and usage: https://github.com/FeralInteractive/gamemode
- MangoHud usage: https://github.com/flightlessmango/MangoHud

Fedora has used swap-on-ZRAM by default since Fedora 33, and later scaled the
virtual device up to RAM size with an 8 GiB cap. ZRAM memory is allocated on
demand rather than reserved at boot. ArcadeLite makes that policy explicit.
Linux kernel documentation permits swappiness above 100 for in-memory swap;
133 is a moderate documented example, not an aggressive 180–200 setting.

- Fedora ZRAM design: https://fedoraproject.org/wiki/Changes/SwapOnZRAM
- Fedora ZRAM scaling: https://fedoraproject.org/wiki/Changes/Scale_ZRAM_to_full_memory_size
- zram-generator configuration: https://github.com/systemd/zram-generator/blob/main/man/zram-generator.conf.md
- Linux VM swappiness: https://docs.kernel.org/admin-guide/sysctl/vm.html#swappiness

## Build-system findings

Universal Blue's current image template uses a Containerfile, `bootc container
lint`, GitHub Actions, and bootc-image-builder for OCI and disk/ISO outputs.
ArcadeLite follows that layout while trimming unrelated template machinery.
All third-party GitHub actions are pinned to commit SHAs, and image publishing
uses the workflow's short-lived token plus keyless Sigstore signing.

- Universal Blue image template:
  https://github.com/ublue-os/image-template
- bootc image builder action:
  https://github.com/osbuild/bootc-image-builder-action

## Explicit non-goals

- A new kernel, package manager, or proprietary graphics driver fork.
- Unsafe GPU overclocking or fixed laptop power-limit changes.
- Claiming every Windows anti-cheat game will work under Linux.
- A universal idle-RAM number independent of hardware and user configuration.

