# Known limitations

- This repository has passed static source checks, but no ISO was compiled or booted
  on the current Windows host because it lacks Podman, Docker, WSL, and
  KVM. The supplied CI performs the real image build and `bootc` lint.
- Exact NVIDIA GPU model was not supplied. The project therefore builds both
  modern/open and older/legacy variants instead of pretending one driver fits
  every card.
- Secure Boot requires BlueBuild key enrollment. A locally derived image should
  also adopt a documented signature-verification policy before public release.
- The Ryzen 7 7445HS is supported as a normal modern x86-64 Phoenix platform;
  laptop-specific Wi-Fi, audio amplifiers, MUX controls, RGB, and hotkeys still
  depend on the exact notebook model and firmware.
- Kernel-level anti-cheat used by some multiplayer games may reject Linux or
  Proton regardless of OS tuning. Check each publisher's current policy.
- NVIDIA suspend/resume and external-display routing vary by firmware and MUX
  topology. Test both on the installer image and again after installation.
- A 1.5 GiB clean-login memory figure is an engineering target, not a verified
  result for hardware that was not available to this build session.
- GHCR packages must be made public before installation so the installed system
  can pull bootc updates without storing a registry credential.
