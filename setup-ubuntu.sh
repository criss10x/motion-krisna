#!/usr/bin/env bash
# Pasang semua kebutuhan workflow gaya-muslim-leveling di Ubuntu 24.04 (VPS atau WSL).
# Jalankan dari root repo: bash setup-ubuntu.sh
set -euo pipefail

sudo apt update
sudo apt install -y ffmpeg python3 python3-numpy git curl ca-certificates gnupg

if ! node --version 2>/dev/null | grep -qE '^v(2[2-9]|[3-9][0-9])'; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt install -y nodejs
fi

if ! command -v google-chrome >/dev/null; then
  curl -fsSLo /tmp/chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
  sudo apt install -y /tmp/chrome.deb
fi

if ! command -v gcloud >/dev/null; then
  curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
  echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" \
    | sudo tee /etc/apt/sources.list.d/google-cloud-sdk.list >/dev/null
  sudo apt update && sudo apt install -y google-cloud-cli
fi

command -v claude >/dev/null || sudo npm install -g @anthropic-ai/claude-code

mkdir -p ~/.claude/skills
cp -r skills/gaya-muslim-leveling ~/.claude/skills/

echo
node --version
python3 -I -c "import numpy; print('numpy', numpy.__version__)"
ffmpeg -version | head -1
google-chrome --version
gcloud --version | head -1
echo
echo "Selesai. Langkah berikutnya: gcloud auth login && gcloud config set project <PROJECT_ID>"
