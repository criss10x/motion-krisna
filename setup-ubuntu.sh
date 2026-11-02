#!/usr/bin/env bash
# Pasang semua kebutuhan workflow gaya-muslim-leveling di Ubuntu 24.04 (VPS atau WSL).
# Jalankan dari root repo: bash setup-ubuntu.sh
set -euo pipefail

sudo apt update
sudo apt install -y ffmpeg python3 python3-numpy git curl ca-certificates gnupg tmux

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

# swap 2 GB sebagai pengaman RAM saat render
if ! swapon --show | grep -q .; then
  sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

mkdir -p ~/.claude/skills
cp -r skills/gaya-muslim-leveling ~/.claude/skills/

echo
node --version
python3 -I -c "import numpy; print('numpy', numpy.__version__)"
ffmpeg -version | head -1
google-chrome --version
gcloud --version | head -1
echo
echo "Selesai. Berikutnya: claude (login), gcloud auth login --no-launch-browser, gcloud config set project <PROJECT_ID>"
echo "Proyek Remotion: salin templates/remotion ke projects/<topik>/film-remotion, lalu cd ke sana && npm i && npx remotion browser ensure (render pakai --gl=swangle)"
