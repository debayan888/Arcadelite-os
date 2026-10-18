# Memory and performance validation

“Low RAM” is treated as a measured quality target, not a package-count claim.
ArcadeLite removes content indexing and unnecessary wait-online startup work,
keeps store clients out of the base image, and relies on on-demand services.

## Reference protocol

1. Install the `open` image on the target laptop.
2. Update once, reboot twice, and log in to a new local user.
3. Do not start Steam, Heroic, Lutris, a browser, or Discover.
4. Wait three minutes after the Plasma desktop becomes idle.
5. Record:

```bash
free --bytes
systemd-cgtop --iterations=1 --depth=3
systemd-analyze
systemd-analyze blame
zramctl
arcadelite-system-report > arcadelite-report.txt
```

The initial engineering target is at most 1.5 GiB `used` memory in `free` after
that clean login. `available` memory matters more than the visually impressive
but misleading `free` column because Linux deliberately uses spare RAM for
cache. Record Plasma, kernel, and NVIDIA driver versions with every result.

## If idle use is higher

Check the largest cgroups and processes instead of applying random sysctl
tweaks:

```bash
systemd-cgtop --iterations=1
ps -eo pid,comm,rss --sort=-rss | head -20
systemctl --user --failed
journalctl --user -b -p warning
```

Common causes are browser background mode, chat clients, file indexing restored
by a user profile, several display buffers, or a driver regression. Do not
disable PipeWire, NetworkManager, power management, or desktop portals to win a
small benchmark; they are required for normal use.

## Gaming validation

Test both native Vulkan and Proton titles. Capture frame pacing, not only mean
FPS. MangoHud is opt-in through `arcadelite-game --hud`; an overlay itself has a
small cost. Compare these cases under the same power adapter and thermal state:

1. AMD iGPU (`--integrated`) for lightweight games.
2. NVIDIA dGPU (`--nvidia`) without HUD.
3. NVIDIA dGPU with HUD for diagnostic capture.

GameMode must return the CPU governor/power state to its earlier value after the
game exits. Never validate performance on battery while expecting AC-powered
results.

