#!/usr/bin/env bash
set -euo pipefail

# Keep the immutable base small: install host-level components that need direct
# hardware access. Game stores themselves are optional Flatpaks installed per
# user by arcadelite-setup.
dnf5 install -y \
  gamescope \
  gamemode \
  goverlay \
  kdialog \
  mangohud \
  steam-devices \
  switcheroo-control \
  vulkan-tools

dnf5 clean all
rm -rf /var/cache/dnf /var/log/dnf* /tmp/*

# Files under system_files mirror their final absolute paths. Copy after package
# installation so ArcadeLite policy files intentionally win over package sample
# defaults such as /usr/share/gamemode/gamemode.ini.
cp -a /ctx/system_files/. /

# Brand without discarding the base image's version and support metadata.
sed -i \
  -e 's/^NAME=.*/NAME="ArcadeLite OS"/' \
  -e 's/^PRETTY_NAME=.*/PRETTY_NAME="ArcadeLite OS (Fedora Atomic)"/' \
  -e 's/^VARIANT=.*/VARIANT="ArcadeLite"/' \
  -e 's/^VARIANT_ID=.*/VARIANT_ID=arcadelite/' \
  /usr/lib/os-release

if ! grep -q '^ID_LIKE=' /usr/lib/os-release; then
  printf '%s\n' 'ID_LIKE="fedora"' >> /usr/lib/os-release
fi
if grep -q '^DOCUMENTATION_URL=' /usr/lib/os-release; then
  sed -i 's#^DOCUMENTATION_URL=.*#DOCUMENTATION_URL="file:///usr/share/doc/arcadelite/quick-start.html"#' /usr/lib/os-release
else
  printf '%s\n' 'DOCUMENTATION_URL="file:///usr/share/doc/arcadelite/quick-start.html"' >> /usr/lib/os-release
fi

# First-login integration is global but runs once per user.
systemctl --global enable arcadelite-first-login.service

# Dynamic Boost exists only on supported NVIDIA notebook stacks.
if systemctl list-unit-files nvidia-powerd.service --no-legend 2>/dev/null | grep -q '^nvidia-powerd.service'; then
  systemctl enable nvidia-powerd.service
fi

# NetworkManager wait-online slows desktop boots and is not required by the
# graphical session. Keep NetworkManager itself fully enabled.
systemctl disable NetworkManager-wait-online.service || true

chmod 0755 \
  /usr/bin/arcadelite-first-login \
  /usr/bin/arcadelite-game \
  /usr/bin/arcadelite-setup \
  /usr/bin/arcadelite-system-report
