#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

REPO="totalnybet-create/totalnybet-create"
RUNNER_NAME="termux-android"
SESSION="gh-runner"

printf '\n[1/6] Termux wake lock\n'
termux-wake-lock 2>/dev/null || true

printf '\n[2/6] Packages\n'
pkg update -y
pkg install -y gh git curl jq tmux proot-distro

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI is not authenticated. Run: gh auth login --hostname github.com --git-protocol https --web"
  exit 20
fi

printf '\n[3/6] Ubuntu proot\n'
if ! proot-distro login ubuntu -- true >/dev/null 2>&1; then
  proot-distro install ubuntu
fi

printf '\n[4/6] Registration token + runner install\n'
TOKEN="$(gh api -X POST "repos/${REPO}/actions/runners/registration-token" --jq .token)"
VERSION="$(curl -fsSL https://api.github.com/repos/actions/runner/releases/latest | jq -r '.tag_name' | sed 's/^v//')"
ARCH_RAW="$(uname -m)"
case "$ARCH_RAW" in
  aarch64|arm64) RUNNER_ARCH="arm64" ;;
  x86_64|amd64) RUNNER_ARCH="x64" ;;
  *) echo "Unsupported architecture: $ARCH_RAW" >&2; exit 21 ;;
esac

proot-distro login ubuntu -- env \
  REPO="$REPO" TOKEN="$TOKEN" VERSION="$VERSION" RUNNER_ARCH="$RUNNER_ARCH" RUNNER_NAME="$RUNNER_NAME" \
  bash -lc '
    set -euo pipefail
    export DEBIAN_FRONTEND=noninteractive
    apt-get update
    apt-get install -y curl ca-certificates git jq tar gzip
    mkdir -p /opt/actions-runner
    cd /opt/actions-runner
    if [ ! -x ./run.sh ]; then
      curl -fL -o actions-runner.tar.gz "https://github.com/actions/runner/releases/download/v${VERSION}/actions-runner-linux-${RUNNER_ARCH}-${VERSION}.tar.gz"
      tar xzf actions-runner.tar.gz
      rm -f actions-runner.tar.gz
      RUNNER_ALLOW_RUNASROOT=1 ./bin/installdependencies.sh || true
    fi
    if [ ! -f .runner ]; then
      RUNNER_ALLOW_RUNASROOT=1 ./config.sh \
        --url "https://github.com/${REPO}" \
        --token "$TOKEN" \
        --name "$RUNNER_NAME" \
        --labels termux \
        --work _work \
        --unattended \
        --replace
    fi
  '

printf '\n[5/6] Start runner in tmux\n'
if tmux has-session -t "$SESSION" 2>/dev/null; then
  tmux kill-session -t "$SESSION"
fi

tmux new-session -d -s "$SESSION" \
  "proot-distro login ubuntu -- bash -lc 'cd /opt/actions-runner && export RUNNER_ALLOW_RUNASROOT=1 && ./run.sh'"

sleep 4

printf '\n[6/6] Health check\n'
if tmux has-session -t "$SESSION" 2>/dev/null; then
  echo "TERMUX_GITHUB_RUNNER_STARTED"
  tmux capture-pane -pt "$SESSION" -S -20 || true
else
  echo "Runner tmux session failed to start" >&2
  exit 22
fi
