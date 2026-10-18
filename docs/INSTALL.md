# Build, install, and recover

## Choose the correct NVIDIA image

- Choose **open** for GeForce GTX 16-series and all RTX GPUs. This is the
  expected choice for Ryzen 7 7445HS gaming laptops commonly paired with an
  RTX 3050/4050-class GPU.
- Choose **legacy** for an older NVIDIA GPU still supported by the proprietary
  driver but not by NVIDIA's open kernel module.
- If uncertain, obtain the exact GPU model in the current OS before installing.

## Build with GitHub Actions

1. Create a new GitHub repository and add this source tree.
2. In repository settings, enable Actions and permit read/write workflow access
   to packages. No long-lived registry password is required.
3. Run **Build bootc images**. It publishes `arcadelite-os-open:latest` and
   `arcadelite-os-legacy:latest` in the owner's GHCR namespace.
4. In each GHCR package's settings, change visibility to public. The ISO job can
   authenticate during its build, but an installed OS needs anonymous read
   access for bootc updates.
5. Run **Build installer ISO**, choosing the matching variant.
6. Download the ISO artifact and verify the workflow completed successfully.
7. Write it to a USB drive using Fedora Media Writer, Rufus in DD mode, or an
   equivalent image writer. Selecting the wrong destination destroys its data.

## Secure Boot

The BlueBuild base signs its NVIDIA kernel modules with the BlueBuild machine
owner key. With Secure Boot enabled, enroll that public key before expecting the
NVIDIA driver to load. Follow BlueBuild's current procedure and compare the key
fingerprint against the upstream repository before enrollment:

https://github.com/blue-build/base-images/blob/main/README.md#migration-from-ublue-base-images

If the key is not enrolled, the OS may boot using fallback graphics while the
NVIDIA module is rejected. Do not disable Secure Boot permanently merely to
hide an enrollment or signature error.

## Install safely

1. Back up personal files and create recovery media for the current OS.
2. Update laptop firmware/BIOS from the manufacturer.
3. Boot the ArcadeLite USB and test keyboard, touchpad, Wi-Fi, audio, brightness,
   sleep/wake, external outputs, and graphics before installing.
4. Keep hybrid/iGPU mode enabled in firmware for best daily-use battery life.
5. Use automatic storage only on a disk you are prepared to erase. Review the
   model and capacity twice before confirming.
6. After the first installed boot, open **ArcadeLite Setup** and install the
   desired game stores.

## Verify the installed system

```bash
arcadelite-system-report
nvidia-smi
cat /sys/module/nvidia_drm/parameters/modeset
gamemoded -t
vulkaninfo --summary
```

The modeset value should be `Y`. On a hybrid laptop, ordinary desktop use should
not keep a 3D workload on the NVIDIA GPU. Launch a test deliberately with:

```bash
arcadelite-game --nvidia --hud -- vkcube
```

## Update and rollback

Inspect the current deployment and check for updates:

```bash
bootc status
sudo bootc upgrade --check
sudo bootc upgrade
systemctl reboot
```

If a new deployment breaks boot, select the previous deployment from the boot
menu. From a working deployment, make the previous image the default with:

```bash
sudo bootc rollback
systemctl reboot
```

Do not delete the previous deployment until graphics, suspend, audio, network,
and representative games have been tested.
