/**
 * player.js —— 主角：移动、重力、跳跃、平台碰撞、朝鼠标射击、变身、受伤
 */
class Player {
  constructor() {
    const p = CONFIG.player;
    this.baseW = p.width;   // 常态尺寸，切换时以此为基准
    this.baseH = p.height;
    this.w = p.width;
    this.h = p.height;
    this.x = p.spawnX;
    this.y = p.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.hp = p.maxHp;
    this.onGround = false;
    this.coyote = 0;       // 离地宽限计时
    this.jumpHeld = false; // 防止按住 W 连跳
    this.weapon = new Weapon();
    this.aimAngle = 0;
    this._cameraX = 0; // 摄像机偏移，draw 时更新，供瞄准换算

    // 变身形态
    this.isBlob = false;   // 是否为放大变圆形态
    this.shiftHeld = false; // 防止按住 Shift 连续切换

    // 受伤 / 无敌
    this.invincible = 0;   // 无敌剩余时间
    this.dead = false;
  }

  get centerX() { return this.x + this.w / 2; }
  get centerY() { return this.y + this.h / 2; }

  hurt(dmg) {
    if (this.invincible > 0 || this.dead) return;
    this.hp -= dmg;
    this.invincible = CONFIG.player.invincibleTime;
    if (this.hp <= 0) { this.hp = 0; this.dead = true; }
  }

  update(dt, platforms, bullets) {
    const p = CONFIG.player;
    const phys = CONFIG.physics;

    if (this.invincible > 0) this.invincible -= dt;

    // --- 武器切换（数字键）---
    for (const n of ['1', '2', '3']) {
      if (Input.isDown(n)) this.weapon.switchByNumber(n);
    }

    // --- 左 Shift 切换变身形态（按下瞬间触发一次）---
    const wantShift = Input.isDown('shift');
    if (wantShift && !this.shiftHeld) {
      this.toggleBlob(platforms);
    }
    this.shiftHeld = wantShift;

    // --- 水平移动 ---
    let dir = 0;
    if (Input.isDown('a', 'arrowleft')) dir -= 1;
    if (Input.isDown('d', 'arrowright')) dir += 1;
    // 变身后坐力期间保留惯性：无输入时不强行清零水平速度
    if (dir !== 0) {
      this.vx = dir * p.moveSpeed;
    } else if (!this.isBlob) {
      this.vx = 0;
    } else {
      // blob 形态无输入时给阻尼，让后坐力惯性自然衰减
      this.vx *= 0.92;
      if (Math.abs(this.vx) < 5) this.vx = 0;
    }

    // --- 跳跃（支持 coyote time）---
    const wantJump = Input.isDown('w', ' ', 'arrowup');
    if (this.onGround) this.coyote = p.coyoteTime;
    else this.coyote = Math.max(0, this.coyote - dt);

    if (wantJump && !this.jumpHeld && this.coyote > 0) {
      this.vy = -p.jumpSpeed;
      this.onGround = false;
      this.coyote = 0;
    }
    this.jumpHeld = wantJump;

    // --- 重力 ---
    this.vy += phys.gravity * dt;
    if (this.vy > phys.maxFallSpeed) this.vy = phys.maxFallSpeed;

    // --- 分轴移动 + 碰撞 ---
    this.x += this.vx * dt;
    this.resolveHorizontal(platforms);

    this.onGround = false;
    this.y += this.vy * dt;
    this.resolveVertical(platforms);

    // --- 世界边界 ---
    if (this.x < 0) this.x = 0;
    if (this.x + this.w > CONFIG.world.width) this.x = CONFIG.world.width - this.w;

    // --- 掉出地图（坑）判定：直接死亡 ---
    if (this.y > CONFIG.canvas.height + 120) { this.hp = 0; this.dead = true; }

    // --- 瞄准（世界坐标 = 鼠标屏幕坐标 + 摄像机偏移）---
    const worldMouseX = Input.mouse.x + this._cameraX;
    const worldMouseY = Input.mouse.y;
    this.aimAngle = Math.atan2(worldMouseY - this.centerY, worldMouseX - this.centerX);

    // --- 射击 ---
    this.weapon.update(dt);
    if (Input.mouseDown) {
      const muzzleX = this.centerX + Math.cos(this.aimAngle) * 24;
      const muzzleY = this.centerY + Math.sin(this.aimAngle) * 24;
      const newBullets = this.weapon.tryFire(muzzleX, muzzleY, this.aimAngle);
      for (const b of newBullets) bullets.push(b);

      // 变身形态：每成功开一枪，施加与射击方向相反的后坐力冲量（推飞）
      if (this.isBlob && newBullets.length > 0) {
        const b = CONFIG.player.blob;
        this.vx -= Math.cos(this.aimAngle) * b.recoil;
        this.vy -= Math.sin(this.aimAngle) * b.recoil;
        this.vx = clamp(this.vx, -b.recoilMaxSpeed, b.recoilMaxSpeed);
        this.vy = clamp(this.vy, -b.recoilMaxSpeed, b.recoilMaxSpeed);
        this.onGround = false; // 让后坐力能把人从地面推起
      }
      return newBullets.length > 0; // 供音效判断是否真的开了枪
    }
    return false;
  }

  // 切换变身形态：以中心为锚缩放尺寸，并做卡墙安全处理
  toggleBlob(platforms) {
    const cx = this.centerX;
    const cy = this.centerY;
    this.isBlob = !this.isBlob;
    const scale = this.isBlob ? CONFIG.player.blob.scale : 1;
    this.w = this.baseW * scale;
    this.h = this.baseH * scale;
    this.x = cx - this.w / 2;
    this.y = cy - this.h / 2;
    if (this.x < 0) this.x = 0;
    if (this.x + this.w > CONFIG.world.width) this.x = CONFIG.world.width - this.w;
    for (const pl of platforms) {
      if (this.overlaps(pl) && this.y + this.h > pl.y && this.y < pl.y) {
        this.y = pl.y - this.h;
      }
    }
  }

  resolveHorizontal(platforms) {
    for (const pl of platforms) {
      if (this.overlaps(pl)) {
        if (this.vx > 0) this.x = pl.x - this.w;
        else if (this.vx < 0) this.x = pl.x + pl.w;
        this.vx = 0;
      }
    }
  }

  resolveVertical(platforms) {
    for (const pl of platforms) {
      if (this.overlaps(pl)) {
        if (this.vy > 0) { this.y = pl.y - this.h; this.onGround = true; }
        else if (this.vy < 0) this.y = pl.y + pl.h;
        this.vy = 0;
      }
    }
  }

  overlaps(r) {
    return this.x < r.x + r.w && this.x + this.w > r.x &&
           this.y < r.y + r.h && this.y + this.h > r.y;
  }

  draw(ctx, cameraX) {
    this._cameraX = cameraX;
    const sx = this.x - cameraX;

    // 受伤无敌时闪烁
    if (this.invincible > 0 && Math.floor(this.invincible * 20) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    if (this.isBlob) {
      ctx.drawImage(Sprites.cache.blob, sx, this.y, this.w, this.h);
    } else {
      ctx.drawImage(Sprites.cache.player, sx, this.y, this.w, this.h);
    }
    ctx.globalAlpha = 1;

    // 枪管（朝鼠标方向）
    ctx.save();
    ctx.translate(sx + this.w / 2, this.y + this.h / 2);
    ctx.rotate(this.aimAngle);
    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(0, -3, this.isBlob ? 44 : 34, 7);
    ctx.fillStyle = '#555';
    ctx.fillRect(0, -3, 8, 7);
    ctx.restore();
  }
}
