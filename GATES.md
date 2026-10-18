# Gates: ArcadeLite OS source distribution

OWNS: **

Scope: A reproducible, low-overhead Fedora Atomic gaming OS image definition for AMD Ryzen 7 7445HS laptops with supported NVIDIA GPUs, including desktop defaults, gaming tools, safety controls, ISO automation, verification, and user documentation.

- [x] G0: this ledger states outcomes that can fail
  CHECK: node C:\Users\mitra\.codex\skills\unlazy\scripts\gate-lint.mjs GATES.md
  EXPECT: LINT OK
  EVIDENCE: automatic-evidence=v1; definition-sha256=9ba59c763b4680843e58a6a9d211e97fbdbd284ee559104557866241cafd49de; exit=0; EXPECT=matched; output-sha256=48630b7361dd44ee870917b12c3d19b9d7bdea738aaca16bb04d4cab83b772d2; output-bytes=8; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\mitra\ArcadeLiteOS; path=b622860d1635/23 entries

- [x] G1: the image definition pins an auditable Fedora Atomic base and installs the declared gaming, NVIDIA integration, laptop, and recovery components
  CHECK: node tests/verify-project.mjs image
  EXPECT: G1 image definition verified
  EVIDENCE: automatic-evidence=v1; definition-sha256=021a11d4d76064c9143389c76be2ce8da09918dc8cbcb7872e7977f0c7dd1159; exit=0; EXPECT=matched; output-sha256=8e94d619fcd2d071d573206d28484f3f53ebdaf077d7f85fcd79ee57f750bbb8; output-bytes=29; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\mitra\ArcadeLiteOS; path=b622860d1635/23 entries

- [x] G2: the installed system has a coherent low-memory KDE Wayland profile, gaming session controls, hybrid-GPU launcher, and safe performance policy
  CHECK: node tests/verify-project.mjs runtime
  EXPECT: G2 runtime integration verified
  EVIDENCE: automatic-evidence=v1; definition-sha256=6c9ca0be8ca34c255ed26cf14540591a5253e41666c61b49abb555cf2210ee74; exit=0; EXPECT=matched; output-sha256=daedcc3952830139ae5bdcb9ec92d6bb896b0fde1b85bfafa620064f1b499815; output-bytes=32; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\mitra\ArcadeLiteOS; path=b622860d1635/23 entries

- [x] G3: normal users receive a polished first-run experience, discoverable game launchers, rollback access, and accessible visual defaults
  CHECK: node tests/verify-project.mjs ux
  EXPECT: G3 user experience verified
  EVIDENCE: automatic-evidence=v1; definition-sha256=ad7bcbb0ed1356391dab4a4dc7dadfefe7f3929b56366924ccb8d4ec951b2e17; exit=0; EXPECT=matched; output-sha256=52e19ade9f3be8522ac0d150c817ea182153bef0fb46fab53167645c9d639c1d; output-bytes=28; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\mitra\ArcadeLiteOS; path=b622860d1635/23 entries

- [x] G4: repository automation can build and validate both an OCI system image and an installable ISO without embedding credentials
  CHECK: node tests/verify-project.mjs automation
  EXPECT: G4 build automation verified
  EVIDENCE: automatic-evidence=v1; definition-sha256=c3fadfc6eb62c11aeebd08e32f7ce26dfcbe4175893f031eb50900095c1e12f3; exit=0; EXPECT=matched; output-sha256=e55e0609fec296825cabb42112aec502c3d64745a1314fce31f7317e0842b8dd; output-bytes=29; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\mitra\ArcadeLiteOS; path=b622860d1635/23 entries

- [x] G5: project tests reject known-bad fixtures as well as accepting the real project
  CHECK: node tests/verify-project.mjs selftest
  EXPECT: G5 verifier controls passed
  EVIDENCE: automatic-evidence=v1; definition-sha256=e82b5b1d6088174ea7f40c68a9d244ad0f41efd68a73c13a31434195dc350278; exit=0; EXPECT=matched; output-sha256=e41c0b832109d44e59ee0ed637052de4250a6da4f2cd7dbac7051fb3a3d6972d; output-bytes=28; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\mitra\ArcadeLiteOS; path=b622860d1635/23 entries

- [x] G6: documentation records researched design decisions, exact hardware scope, RAM measurement method, build/install steps, NVIDIA Secure Boot caveats, recovery, and project limitations
  CHECK: node tests/verify-project.mjs docs
  EXPECT: G6 documentation verified
  EVIDENCE: automatic-evidence=v1; definition-sha256=967bbdfe0dd60cc1115e4163b8994340bdc6e36c09ae5717c58a0b50d8684d27; exit=0; EXPECT=matched; output-sha256=3772b472553942885f6043cc001c79bf04e9b05ee6ad5aa49af5ab892c99c99a; output-bytes=26; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\mitra\ArcadeLiteOS; path=b622860d1635/23 entries
