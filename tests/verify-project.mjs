import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(process.env.ARCADELITE_ROOT || path.join(import.meta.dirname, ".."));

class VerificationError extends Error {}

function fail(message) {
  throw new VerificationError(message);
}

function rel(name) {
  return path.join(root, ...name.split("/"));
}

function read(name) {
  const file = rel(name);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) fail(`missing file: ${name}`);
  return fs.readFileSync(file, "utf8");
}

function exists(name) {
  const file = rel(name);
  if (!fs.existsSync(file)) fail(`missing path: ${name}`);
}

function has(name, ...needles) {
  const value = read(name);
  for (const needle of needles) {
    if (!value.includes(needle)) fail(`${name} does not contain ${JSON.stringify(needle)}`);
  }
  return value;
}

function lacks(name, ...needles) {
  const value = read(name);
  for (const needle of needles) {
    if (value.includes(needle)) fail(`${name} unexpectedly contains ${JSON.stringify(needle)}`);
  }
  return value;
}

function allFiles(start = root) {
  const output = [];
  for (const entry of fs.readdirSync(start, { withFileTypes: true })) {
    if ([".git", ".tools", ".upstream"].includes(entry.name)) continue;
    const full = path.join(start, entry.name);
    if (entry.isDirectory()) output.push(...allFiles(full));
    else output.push(full);
  }
  return output;
}

function assertPinnedActions(name) {
  const value = read(name);
  const uses = [...value.matchAll(/^\s*-?\s*uses:\s*([^\s#]+)(?:\s+#.*)?$/gm)].map((m) => m[1]);
  if (!uses.length) fail(`${name} has no actions to verify`);
  for (const action of uses) {
    if (!/@[0-9a-f]{40}$/.test(action)) fail(`${name} action is not commit-pinned: ${action}`);
  }
}

function secretFindings(files = allFiles()) {
  const patterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\bAKIA[0-9A-Z]{16}\b/,
    /\bghp_[A-Za-z0-9]{30,}\b/,
    /\bgithub_pat_[A-Za-z0-9_]{30,}\b/,
  ];
  const findings = [];
  for (const file of files) {
    if (path.basename(file) === "verify-project.mjs") continue;
    if (file.includes(path.join("tests", "fixtures", "bad"))) continue;
    const data = fs.readFileSync(file, "utf8");
    if (patterns.some((pattern) => pattern.test(data))) findings.push(file);
  }
  return findings;
}

function verifyImage() {
  has("Containerfile",
    'ARG BASE_IMAGE="ghcr.io/blue-build/base-images/fedora-kinoite-nvidia-open:latest"',
    "FROM ${BASE_IMAGE}",
    "/ctx/build_files/build.sh",
    "bootc container lint",
    "org.opencontainers.image.licenses");
  lacks("Containerfile", "YOUR_GITHUB", "OWNER/", "TODO");

  const build = has("build_files/build.sh",
    "set -euo pipefail",
    "gamescope",
    "gamemode",
    "goverlay",
    "mangohud",
    "steam-devices",
    "switcheroo-control",
    "vulkan-tools",
    "NetworkManager-wait-online.service",
    "nvidia-powerd.service",
    "ArcadeLite OS");
  if (/dnf5 install[^\n]*steam(?:\s|$)/.test(build)) fail("Steam must remain an optional user Flatpak");
  if (build.indexOf("cp -a /ctx/system_files/. /") < build.indexOf("dnf5 install -y")) {
    fail("system policy files must be copied after packages so RPM samples cannot overwrite them");
  }

  has("image-template.env",
    "fedora-kinoite-nvidia-open:latest",
    "fedora-kinoite-nvidia:latest",
    "bootc-image-builder:latest");
  has("disk_config/iso.toml", "customizations.installer.kickstart", "bootc switch --mutate-in-place", "Anaconda.Modules.Storage");
  exists("LICENSE");
  console.log("G1 image definition verified");
}

function verifyRuntime() {
  has("system_files/usr/bin/arcadelite-game",
    "gamemoderun",
    "__NV_PRIME_RENDER_OFFLOAD=1",
    "__GLX_VENDOR_LIBRARY_NAME=nvidia",
    "__VK_LAYER_NV_optimus=NVIDIA_only",
    "--integrated",
    "--hud",
    'exec "${cmd[@]}"');
  lacks("system_files/usr/bin/arcadelite-game", "eval ", "sh -c");

  has("system_files/usr/share/gamemode/gamemode.ini", "desiredgov=performance", "inhibit_screensaver=1");
  has("system_files/usr/lib/modprobe.d/90-arcadelite-nvidia.conf", "nvidia_drm modeset=1 fbdev=1", "NVreg_DynamicPowerManagement=0x03");
  has("system_files/usr/lib/systemd/zram-generator.conf.d/90-arcadelite.conf", "zram-size = min(ram, 8192)", "compression-algorithm = zstd", "swap-priority = 100");
  has("system_files/usr/lib/sysctl.d/90-arcadelite-memory.conf", "vm.swappiness = 133");
  has("system_files/etc/xdg/baloofilerc", "Indexing-Enabled=false");
  has("system_files/etc/xdg/kdeglobals", "ColorScheme=BreezeDark", "AnimationDurationFactor=0.75", "SingleClick=false");
  console.log("G2 runtime integration verified");
}

function verifyUx() {
  has("system_files/usr/lib/systemd/user/arcadelite-first-login.service",
    "After=graphical-session.target",
    "ConditionPathExists=!%h/.local/state/arcadelite/welcome-complete",
    "ExecStart=/usr/bin/arcadelite-first-login");
  has("system_files/usr/bin/arcadelite-first-login", "kwriteconfig6", "plasma-apply-wallpaperimage", "arcadelite-setup menu");
  has("system_files/usr/bin/arcadelite-setup",
    "flatpak remote-add --user --if-not-exists flathub",
    "com.valvesoftware.Steam",
    "com.heroicgameslauncher.hgl",
    "net.lutris.Lutris",
    "welcome-complete");
  lacks("system_files/usr/bin/arcadelite-first-login", "sudo ", "rm -rf");
  has("system_files/usr/share/applications/arcadelite-setup.desktop", "Name=ArcadeLite Setup", "Categories=Game;Settings;");
  has("system_files/usr/share/applications/arcadelite-report.desktop", "Name=ArcadeLite System Report", "arcadelite-system-report");
  has("system_files/usr/share/wallpapers/ArcadeLite/metadata.json", '"Id": "ArcadeLite"', '"License": "CC0-1.0"');
  const svg = has("system_files/usr/share/wallpapers/ArcadeLite/contents/images/2560x1440.svg", "<svg", "ARCADELITE", "PLAY FAST · WORK LIGHT");
  if (!/width="2560"\s+height="1440"/.test(svg)) fail("wallpaper dimensions are not 2560x1440");
  const guide = has("system_files/usr/share/doc/arcadelite/quick-start.html", '<meta charset="utf-8">', "ArcadeLite OS Quick Start", "bootc rollback");
  if (!/<h1>/.test(guide) || !/<h2>/.test(guide)) fail("quick-start guide lacks semantic headings");
  console.log("G3 user experience verified");
}

function verifyAutomation() {
  const workflows = [
    ".github/workflows/verify.yml",
    ".github/workflows/build.yml",
    ".github/workflows/build-iso.yml",
  ];
  for (const workflow of workflows) assertPinnedActions(workflow);

  has(".github/workflows/build.yml",
    "permissions:",
    "packages: write",
    "id-token: write",
    "variant: open",
    "variant: legacy",
    "podman build",
    "bootc container lint",
    "cosign sign --yes",
    "${{ secrets.GITHUB_TOKEN }}");
  has(".github/workflows/build-iso.yml",
    "workflow_dispatch:",
    "options: [open, legacy]",
    "docker/login-action@",
    "disk_config/iso.generated.toml",
    "bootc-image-builder-action@",
    "types: anaconda-iso",
    "if-no-files-found: error",
    "retention-days: 14");
  has(".github/workflows/verify.yml", "node tests/verify-project.mjs all", "bash -n");

  const findings = secretFindings();
  if (findings.length) fail(`possible embedded secret in: ${findings.map((f) => path.relative(root, f)).join(", ")}`);
  console.log("G4 build automation verified");
}

function verifyDocs() {
  has("README.md",
    "AMD Ryzen 7 7445HS",
    "1.5 GiB",
    "not a guarantee",
    "Secure Boot",
    "bootc rollback",
    "Windows without Podman, Docker, WSL, or KVM",
    "real ISO build and boot test are still required");
  has("docs/ARCHITECTURE.md",
    "Research was performed on 18 October 2026",
    "amd.com/ja/products/processors/laptop/ryzen/7000-series/amd-ryzen-7-7445hs.html",
    "github.com/blue-build/base-images",
    "download.nvidia.com/XFree86/Linux-x86_64/495.44/README/primerenderoffload.html",
    "community.kde.org/Plasma/Wayland/Nvidia",
    "docs.kernel.org/admin-guide/sysctl/vm.html#swappiness",
    "Explicit non-goals");
  has("docs/INSTALL.md", "Choose the correct NVIDIA image", "Secure Boot", "Back up personal files", "sudo bootc rollback");
  has("docs/PERFORMANCE.md", "Reference protocol", "1.5 GiB", "free --bytes", "systemd-cgtop", "engineering target");
  has("docs/LIMITATIONS.md", "no ISO was compiled or booted", "Exact NVIDIA GPU model was not supplied", "anti-cheat", "GHCR packages must be made public");
  console.log("G6 documentation verified");
}

function verifySelftest() {
  const fixture = read("tests/fixtures/bad/embedded-secret.txt");
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "arcadelite-verifier-"));
  try {
    const tempFile = path.join(tempDir, "fixture.txt");
    fs.writeFileSync(tempFile, fixture);
    const caught = secretFindings([tempFile]);
    if (caught.length !== 1) fail("secret scanner accepted its known-positive fixture");

    let missingTokenRejected = false;
    try {
      has("tests/fixtures/bad/missing-token.txt", "required-success-token");
    } catch (error) {
      if (error instanceof VerificationError) missingTokenRejected = true;
      else throw error;
    }
    if (!missingTokenRejected) fail("content checker accepted a known-bad missing-token fixture");
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  console.log("G5 verifier controls passed");
}

const commands = {
  image: verifyImage,
  runtime: verifyRuntime,
  ux: verifyUx,
  automation: verifyAutomation,
  selftest: verifySelftest,
  docs: verifyDocs,
};

const requested = process.argv[2] || "all";
try {
  if (requested === "all") {
    for (const name of ["image", "runtime", "ux", "automation", "selftest", "docs"]) commands[name]();
    console.log("All project verification passed");
  } else if (commands[requested]) {
    commands[requested]();
  } else {
    fail(`unknown verification group: ${requested}`);
  }
} catch (error) {
  console.error(`VERIFICATION FAILED: ${error.message}`);
  process.exitCode = 1;
}
