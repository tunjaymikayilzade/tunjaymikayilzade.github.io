const root = document.querySelector("#platformer");

if (root) {
  const canvas = root.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const countEl = root.querySelector("#game-count");
  const messageEl = root.querySelector("#game-message");
  const restartBtn = root.querySelector("#game-restart");

  const VIEW_W = 800;
  const VIEW_H = 360;
  const WORLD_W = 2000;
  const GROUND_Y = 300;
  const GRAVITY = 0.55;
  const JUMP_SPEED = -11.8;
  const MAX_SPEED = 3.6;

  const FACTS = [
    {
      label: "High school",
      text: "I finished high school at Turkish Diyanet Foundation Baku Turkish Lyceum."
    },
    {
      label: "University",
      text: "Now I study Computer Science (BSCS) at ADA University."
    },
    {
      label: "Reading",
      text: "I have read over 50 books: detective, history, classics, and philosophy. Philosophy is what I read most now."
    },
    {
      label: "Video games",
      text: "I enjoy video games a lot, mostly story games. I don’t like competitive games that much."
    }
  ];

  const START_MESSAGE = "Bump a ? block from below to learn something about me.";

  const BLOCK_SIZE = 44;
  const BLOCK_Y = 126;
  const BLOCK_XS = [420, 780, 1140, 1500];
  const FLAG_X = 1840;

  const keys = { left: false, right: false, jump: false };
  let active = false;
  let player;
  let blocks;
  let found;
  let tick;

  function reset() {
    player = { x: 60, y: GROUND_Y - 38, w: 26, h: 38, vx: 0, vy: 0, onGround: true, facing: 1, step: 0 };
    blocks = BLOCK_XS.map((x, i) => ({ x, y: BLOCK_Y, w: BLOCK_SIZE, h: BLOCK_SIZE, used: false, bounce: 0, fact: FACTS[i] }));
    found = 0;
    tick = 0;
    showMessage("Start", START_MESSAGE);
    updateCount();
  }

  function showMessage(label, text) {
    messageEl.innerHTML = "";
    const tag = document.createElement("p");
    tag.className = "card-label";
    tag.textContent = label;
    const body = document.createElement("p");
    body.textContent = text;
    messageEl.append(tag, body);
  }

  function updateCount() {
    countEl.textContent = `${found} / ${FACTS.length} blocks`;
  }

  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function hitBlock(block) {
    if (block.used) return;
    block.used = true;
    block.bounce = 12;
    found += 1;
    showMessage(block.fact.label, block.fact.text);
    updateCount();
  }

  function step() {
    tick += 1;
    const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);

    if (dir) {
      player.vx += dir * 0.5;
      player.facing = dir;
    } else {
      player.vx *= 0.78;
    }
    player.vx = clamp(player.vx, -MAX_SPEED, MAX_SPEED);
    if (Math.abs(player.vx) < 0.05) player.vx = 0;

    player.x = clamp(player.x + player.vx, 0, WORLD_W - player.w);
    blocks.forEach((block) => {
      if (!overlaps(player, block)) return;
      player.x = player.vx > 0 ? block.x - player.w : block.x + block.w;
      player.vx = 0;
    });

    if (keys.jump && player.onGround) {
      player.vy = JUMP_SPEED;
      player.onGround = false;
    }
    player.vy += GRAVITY;
    player.y += player.vy;
    player.onGround = false;

    if (player.y + player.h >= GROUND_Y) {
      player.y = GROUND_Y - player.h;
      player.vy = 0;
      player.onGround = true;
    }

    blocks.forEach((block) => {
      if (!overlaps(player, block)) return;
      if (player.vy < 0) {
        player.y = block.y + block.h;
        player.vy = 1;
        hitBlock(block);
      } else if (player.vy > 0) {
        player.y = block.y - player.h;
        player.vy = 0;
        player.onGround = true;
      }
    });

    blocks.forEach((block) => {
      if (block.bounce > 0) block.bounce -= 1;
    });

    if (player.onGround) player.step += Math.abs(player.vx) * 0.22;

    if (player.x + player.w > FLAG_X && !player.atFlag) {
      player.atFlag = true;
      if (found === FACTS.length) {
        showMessage("Finish", "You found all four blocks. Press Restart to play again.");
      } else {
        showMessage("Finish", "There are still ? blocks behind you. Walk back and bump them.");
      }
    }
    if (player.x + player.w <= FLAG_X) player.atFlag = false;
  }

  function drawBackground(camX) {
    const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    sky.addColorStop(0, "#d6ece8");
    sky.addColorStop(1, "#f6f1e6");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    ctx.fillStyle = "#b9dcd2";
    for (let i = -1; i < 6; i += 1) {
      const x = i * 320 - ((camX * 0.3) % 320);
      ctx.beginPath();
      ctx.ellipse(x + 160, GROUND_Y, 170, 90, 0, Math.PI, 0);
      ctx.fill();
    }
    ctx.fillStyle = "#a3cfc3";
    for (let i = -1; i < 5; i += 1) {
      const x = i * 420 + 120 - ((camX * 0.5) % 420);
      ctx.beginPath();
      ctx.ellipse(x + 150, GROUND_Y, 130, 55, 0, Math.PI, 0);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    [[120, 60], [520, 90], [880, 50], [1260, 80], [1640, 55]].forEach(([cx, cy]) => {
      const x = cx - camX * 0.6;
      [[0, 0, 18], [22, 4, 22], [46, 0, 16]].forEach(([dx, dy, radius]) => {
        ctx.beginPath();
        ctx.arc(x + dx, cy + dy, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }

  function drawGround(camX) {
    ctx.fillStyle = "#a8703a";
    ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
    ctx.fillStyle = "#3f8f6b";
    ctx.fillRect(0, GROUND_Y, VIEW_W, 10);
    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    for (let x = -(camX % 40); x < VIEW_W; x += 40) {
      ctx.fillRect(x, GROUND_Y + 22, 20, 6);
      ctx.fillRect(x + 20, GROUND_Y + 40, 20, 6);
    }
  }

  function drawBlocks(camX) {
    blocks.forEach((block) => {
      const offset = block.bounce > 0 ? -Math.sin((block.bounce / 12) * Math.PI) * 10 : 0;
      const x = block.x - camX;
      const y = block.y + offset;
      ctx.fillStyle = block.used ? "#b9b2a3" : "#1a6b63";
      ctx.fillRect(x, y, block.w, block.h);
      ctx.strokeStyle = block.used ? "#8f897c" : "#8fd0c8";
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 1.5, y + 1.5, block.w - 3, block.h - 3);
      if (!block.used) {
        ctx.fillStyle = "#fffdf8";
        ctx.font = "700 26px Georgia, serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("?", x + block.w / 2, y + block.h / 2 + 1);
      }
    });
  }

  function drawFlag(camX) {
    const x = FLAG_X - camX;
    ctx.fillStyle = "#5e6974";
    ctx.fillRect(x, GROUND_Y - 120, 5, 120);
    ctx.fillStyle = found === FACTS.length ? "#1a6b63" : "#9a5b24";
    ctx.beginPath();
    ctx.moveTo(x + 5, GROUND_Y - 120);
    ctx.lineTo(x + 52, GROUND_Y - 102);
    ctx.lineTo(x + 5, GROUND_Y - 84);
    ctx.closePath();
    ctx.fill();
  }

  function drawPlayer(camX) {
    const x = Math.round(player.x - camX);
    const y = Math.round(player.y);
    const swing = player.onGround ? Math.sin(player.step) * 5 : 4;

    ctx.fillStyle = "#1c2a45";
    ctx.fillRect(x + 5 + swing, y + 28, 7, 10);
    ctx.fillRect(x + 14 - swing, y + 28, 7, 10);

    ctx.fillStyle = "#243a5e";
    ctx.fillRect(x + 2, y + 13, 22, 17);
    ctx.fillStyle = "#fffdf8";
    ctx.fillRect(x + 10, y + 13, 6, 8);
    ctx.fillStyle = "#1c2a45";
    ctx.fillRect(x + 12, y + 15, 2, 12);

    ctx.fillStyle = "#e9b996";
    ctx.fillRect(x + 4, y + 1, 18, 14);
    ctx.fillStyle = "#1f1a17";
    ctx.fillRect(x + 3, y - 2, 20, 6);
    ctx.fillRect(player.facing > 0 ? x + 3 : x + 19, y + 2, 4, 6);

    ctx.fillStyle = "#1f1a17";
    ctx.fillRect(x + (player.facing > 0 ? 15 : 8), y + 7, 3, 3);
  }

  function drawOverlay() {
    ctx.fillStyle = "rgba(36, 48, 64, 0.55)";
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = "#fffdf8";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "700 26px Georgia, serif";
    ctx.fillText("Click here to play", VIEW_W / 2, VIEW_H / 2 - 16);
    ctx.font = "16px sans-serif";
    ctx.fillText("A = left   D = right   SPACE = jump", VIEW_W / 2, VIEW_H / 2 + 20);
  }

  function draw() {
    const camX = clamp(player.x - VIEW_W * 0.4, 0, WORLD_W - VIEW_W);
    drawBackground(camX);
    drawGround(camX);
    drawFlag(camX);
    drawBlocks(camX);
    drawPlayer(camX);
    if (!active) drawOverlay();
  }

  function setupCanvas() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = VIEW_W * ratio;
    canvas.height = VIEW_H * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  const keyMap = {
    KeyA: "left",
    ArrowLeft: "left",
    KeyD: "right",
    ArrowRight: "right",
    Space: "jump",
    ArrowUp: "jump",
    KeyW: "jump"
  };

  function releaseKeys() {
    keys.left = false;
    keys.right = false;
    keys.jump = false;
  }

  canvas.addEventListener("keydown", (event) => {
    const action = keyMap[event.code];
    if (!action) return;
    event.preventDefault();
    keys[action] = true;
  });

  canvas.addEventListener("keyup", (event) => {
    const action = keyMap[event.code];
    if (!action) return;
    event.preventDefault();
    keys[action] = false;
  });

  canvas.addEventListener("focus", () => {
    active = true;
  });

  canvas.addEventListener("blur", () => {
    active = false;
    releaseKeys();
  });

  canvas.addEventListener("pointerdown", () => canvas.focus());

  root.querySelectorAll("[data-control]").forEach((button) => {
    const action = button.dataset.control;
    const press = (event) => {
      event.preventDefault();
      active = true;
      keys[action] = true;
    };
    const release = () => {
      keys[action] = false;
    };
    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointerleave", release);
    button.addEventListener("pointercancel", release);
  });

  restartBtn.addEventListener("click", () => {
    reset();
    releaseKeys();
    canvas.focus();
  });

  let last = performance.now();
  let lag = 0;

  function frame(now) {
    lag += Math.min(now - last, 100);
    last = now;
    while (lag >= 1000 / 60) {
      if (active) step();
      lag -= 1000 / 60;
    }
    draw();
    requestAnimationFrame(frame);
  }

  setupCanvas();
  reset();
  requestAnimationFrame(frame);
}
