/**
 * main.js —— 入口与游戏主循环
 * requestAnimationFrame 驱动，按 deltaTime 更新，保证不同帧率速度一致。
 */
(function () {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  // 初始化输入
  Input.init(canvas);

  // 初始化实体
  const player = new Player();
  const platforms = Level.build();
  let bullets = [];
  let cameraX = 0;

  // 摄像机：横向跟随玩家，保持其在屏幕中央，并夹在世界边界内
  function updateCamera() {
    const half = CONFIG.canvas.width / 2;
    cameraX = player.centerX - half;
    const maxCam = CONFIG.world.width - CONFIG.canvas.width;
    if (cameraX < 0) cameraX = 0;
    if (cameraX > maxCam) cameraX = maxCam;
  }

  // HUD：血条 + 提示
  function drawHUD() {
    // 血条
    const barW = 200, barH = 16, x = 16, y = 16;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(x, y, barW, barH);
    const ratio = Math.max(0, player.hp / CONFIG.player.maxHp);
    ctx.fillStyle = '#e94560';
    ctx.fillRect(x, y, barW * ratio, barH);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(x, y, barW, barH);
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.fillText('HP ' + Math.round(player.hp), x + 6, y + 12);
  }

  // 主循环
  let last = performance.now();
  function loop(now) {
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.05) dt = 0.05; // 防止切后台后 dt 过大导致穿墙

    // --- 更新 ---
    player.update(dt, platforms, bullets);
    for (const b of bullets) b.update(dt);
    bullets = bullets.filter((b) => !b.dead);
    updateCamera();
    // 把最新摄像机偏移同步给玩家，供下一帧瞄准换算
    player._cameraX = cameraX;

    // --- 绘制 ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = CONFIG.world.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    Level.draw(ctx, cameraX, platforms);
    for (const b of bullets) b.draw(ctx, cameraX);
    player.draw(ctx, cameraX);
    drawHUD();

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
