/**
 * main.js —— 入口、游戏状态机与主循环
 * 状态：menu(菜单) / playing(进行中) / win(胜利) / lose(失败)
 */
(function () {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = CONFIG.canvas.width, H = CONFIG.canvas.height;

  // 预渲染贴图 + 音效
  Sprites.init();
  Sound.init();
  Input.init(canvas);

  // ---- 游戏运行时状态 ----
  let state = 'menu';
  let player, enemies, bullets, enemyBullets, pickups, particles;
  let cameraX = 0, score = 0, kills = 0, elapsed = 0;
  let bestScore = Number(localStorage.getItem('chaos_best') || 0);
  let clickLatch = false; // 菜单/结算界面点击去抖

  function reset() {
    Level.build();
    player = new Player();
    enemies = Level.spawnPoints.map(sp => new Enemy(sp.x, sp.y, sp.type));
    bullets = [];
    enemyBullets = [];
    pickups = [];
    particles = [];
    cameraX = 0; score = 0; kills = 0; elapsed = 0;
  }

  // ---- 粒子特效 ----
  function spawnParticles(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      particles.push({
        x, y,
        vx: rand(-180, 180), vy: rand(-260, 60),
        life: rand(0.3, 0.7), color, size: rand(2, 5),
      });
    }
  }

  // ---- 摄像机 ----
  function updateCamera() {
    cameraX = clamp(player.centerX - W / 2, 0, CONFIG.world.width - W);
    player._cameraX = cameraX;
  }

  // ---- 碰撞：圆(子弹) vs 矩形 ----
  function bulletHitsRect(b, r) {
    const cx = clamp(b.x, r.x, r.x + (r.w || r.width));
    const cy = clamp(b.y, r.y, r.y + (r.h || r.height));
    const dx = b.x - cx, dy = b.y - cy;
    return dx*dx + dy*dy <= b.radius*b.radius;
  }

  // ================= 更新逻辑 =================
  function updatePlaying(dt) {
    elapsed += dt;

    // 玩家（返回本帧是否开枪，用于音效）
    const fired = player.update(dt, Level.platforms, bullets);
    if (fired) {
      if (player.weapon.current === 'shotgun') Sound.shotgun(); else Sound.shoot();
    }
    if (player.dead) { endGame(false); return; }

    // 玩家子弹
    for (const b of bullets) b.update(dt);
    // 敌人子弹
    for (const b of enemyBullets) b.update(dt);

    // 敌人
    for (const e of enemies) {
      e.update(dt, Level.platforms, player, enemyBullets);
      // 接触伤害（冲锋兵 / Boss）：受敌人自身接触冷却限制，避免贴身瞬间磨血
      if (!e.dead && e.cfg.touchDamage && e.touchCd <= 0 && player.overlaps(e)) {
        player.hurt(e.cfg.touchDamage);
        e.touchCd = e.cfg.touchCd || 0.8;
        Sound.hurt();
        if (player.dead) { endGame(false); return; }
      }
    }

    // 玩家子弹命中敌人
    for (const b of bullets) {
      if (b.dead) continue;
      // 撞平台消失
      for (const pl of Level.platforms) { if (bulletHitsRect(b, pl)) { b.dead = true; break; } }
      if (b.dead) continue;
      for (const e of enemies) {
        if (e.dead) continue;
        if (bulletHitsRect(b, e)) {
          e.hurt(b.damage);
          b.dead = true;
          spawnParticles(b.x, b.y, '#ffcf6b', 6);
          Sound.hit();
          if (e.dead) onEnemyKilled(e);
          break;
        }
      }
    }

    // 敌人子弹命中玩家 / 撞平台
    for (const b of enemyBullets) {
      if (b.dead) continue;
      for (const pl of Level.platforms) { if (bulletHitsRect(b, pl)) { b.dead = true; break; } }
      if (b.dead) continue;
      if (bulletHitsRect(b, player)) {
        b.dead = true;
        player.hurt(b.damage);
        spawnParticles(b.x, b.y, '#ff6b6b', 5);
        Sound.hurt();
        if (player.dead) { endGame(false); return; }
      }
    }

    // 掉落物
    for (const pk of pickups) {
      pk.update(dt, Level.platforms);
      if (!pk.dead && pk.tryPickup(player)) Sound.pickup();
    }

    // 粒子
    for (const p of particles) {
      p.vy += 900 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
    }

    // 清理死亡实体
    bullets = bullets.filter(b => !b.dead);
    enemyBullets = enemyBullets.filter(b => !b.dead);
    enemies = enemies.filter(e => !e.dead);
    pickups = pickups.filter(p => !p.dead);
    particles = particles.filter(p => p.life > 0);

    updateCamera();

    // 到达终点旗帜 -> 胜利
    if (player.x + player.w >= Level.goalX) endGame(true);
  }

  function onEnemyKilled(e) {
    kills++;
    score += e.cfg.score;
    spawnParticles(e.centerX, e.centerY, e.cfg.color, 14);
    Sound.enemyDie();
    // 概率掉落
    if (Math.random() < CONFIG.drop.chance) {
      const kind = Math.random() < 0.5 ? 'heal' : 'ammo';
      pickups.push(new Pickup(e.centerX - CONFIG.drop.size/2, e.centerY, kind));
    }
  }

  function endGame(won) {
    state = won ? 'win' : 'lose';
    // 分数加成：剩余血量 + 时间奖励
    if (won) score += Math.round(player.hp * 5) + Math.max(0, Math.round(600 - elapsed) * 2);
    if (score > bestScore) { bestScore = score; localStorage.setItem('chaos_best', String(bestScore)); }
    clickLatch = true; // 防止死亡瞬间的点击穿透到重开
    if (won) Sound.win(); else Sound.lose();
  }

  // ================= 绘制 =================
  function drawWorld() {
    Level.drawBackground(ctx, cameraX);
    Level.drawTrees(ctx, cameraX);
    Level.drawPlatforms(ctx, cameraX);
    Level.drawGoal(ctx, cameraX);

    for (const pk of pickups) pk.draw(ctx, cameraX);
    for (const e of enemies) e.draw(ctx, cameraX);
    for (const b of bullets) b.draw(ctx, cameraX);
    for (const b of enemyBullets) b.draw(ctx, cameraX);
    player.draw(ctx, cameraX);

    // 粒子
    for (const p of particles) {
      ctx.globalAlpha = clamp(p.life * 2, 0, 1);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - cameraX, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    drawHUD();
  }

  function drawHUD() {
    // 血条
    const bx = 16, by = 16, bw = 220, bh = 18;
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#e94560'; ctx.fillRect(bx, by, bw * Math.max(0, player.hp/CONFIG.player.maxHp), bh);
    ctx.strokeStyle = '#fff'; ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif';
    ctx.fillText('HP ' + Math.round(player.hp), bx + 8, by + 13);

    // 武器 + 弹药
    const spec = player.weapon.spec;
    const ammo = player.weapon.ammo[player.weapon.current];
    ctx.font = '14px sans-serif'; ctx.fillStyle = '#fff';
    ctx.fillText('武器: ' + spec.name + '   弹药: ' + (ammo === Infinity ? '∞' : ammo), bx, by + 40);
    ctx.fillStyle = '#9aa0b5'; ctx.font = '11px sans-serif';
    ctx.fillText('[1]手枪  [2]冲锋枪  [3]霰弹枪  左Shift变身', bx, by + 58);

    // 得分 / 击杀 / 进度
    ctx.textAlign = 'right'; ctx.fillStyle = '#ffd966'; ctx.font = 'bold 16px sans-serif';
    ctx.fillText('得分 ' + score, W - 16, 24);
    ctx.fillStyle = '#fff'; ctx.font = '13px sans-serif';
    ctx.fillText('击杀 ' + kills + '  剩余敌人 ' + enemies.length, W - 16, 46);
    const prog = Math.min(100, Math.round(player.x / Level.goalX * 100));
    ctx.fillText('探索进度 ' + prog + '%', W - 16, 64);
    ctx.textAlign = 'left';
  }

  function drawCenteredPanel(title, lines, accent) {
    // 半透明遮罩
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = accent; ctx.font = 'bold 42px sans-serif';
    ctx.fillText(title, W/2, H/2 - 60);
    ctx.fillStyle = '#fff'; ctx.font = '18px sans-serif';
    lines.forEach((ln, i) => ctx.fillText(ln, W/2, H/2 - 10 + i * 30));
    ctx.textAlign = 'left';
  }

  function drawMenu() {
    Level.drawBackground(ctx, 0);
    drawCenteredPanel('混乱大枪战', [
      '横版 2D 枪战冒险 · 地图长达 ' + CONFIG.world.width + 'px',
      'WASD 移动跳跃 · 鼠标瞄准 · 左键射击',
      '1/2/3 换武器 · 左 Shift 变身(开枪推飞)',
      '最高分 ' + bestScore,
      '', '▶ 点击屏幕 开始游戏',
    ], '#ffd966');
  }

  function drawEnd(won) {
    drawWorld(); // 定格最后画面
    drawCenteredPanel(won ? '通关胜利！' : '你阵亡了', [
      '得分 ' + score + '   击杀 ' + kills,
      '用时 ' + elapsed.toFixed(1) + 's   最高分 ' + bestScore,
      '', '▶ 点击屏幕 再来一局',
    ], won ? '#2ecc71' : '#e94560');
  }

  // ================= 输入：菜单/结算界面点击 =================
  canvas.addEventListener('mousedown', () => {
    if (state === 'menu') {
      reset(); state = 'playing';
    } else if (state === 'win' || state === 'lose') {
      if (clickLatch) return; // 需先松开再点
      reset(); state = 'playing';
    }
  });
  window.addEventListener('mouseup', () => { clickLatch = false; });

  // ================= 主循环 =================
  let last = performance.now();
  function loop(now) {
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.05) dt = 0.05; // 防切后台后 dt 过大导致穿墙

    ctx.clearRect(0, 0, W, H);

    if (state === 'menu') {
      drawMenu();
    } else if (state === 'playing') {
      updatePlaying(dt);
      if (state === 'playing') drawWorld();
      else if (state === 'win') drawEnd(true);
      else drawEnd(false);
    } else if (state === 'win') {
      drawEnd(true);
    } else if (state === 'lose') {
      drawEnd(false);
    }

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
