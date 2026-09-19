/**
 * enemy.js —— 敌人与简易 AI
 * 冲锋兵：朝玩家跑动，接触造成伤害
 * 枪手：保持距离，进入射程后开火
 * Boss：血厚，冲撞 + 弹幕
 */
class Enemy {
  constructor(x, y, type) {
    const cfg = CONFIG.enemies[type];
    this.type = type;
    this.cfg = cfg;
    this.w = cfg.w; this.h = cfg.h;
    this.x = x; this.y = y;
    this.vx = 0; this.vy = 0;
    this.hp = cfg.hp;
    this.maxHp = cfg.hp;
    this.onGround = false;
    this.fireCd = rand(0, 1);
    this.touchCd = 0;     // 接触伤害冷却计时
    this.dead = false;
    this.hitFlash = 0;   // 受击闪白计时
    this.facing = -1;
  }

  get centerX() { return this.x + this.w / 2; }
  get centerY() { return this.y + this.h / 2; }

  hurt(dmg) {
    this.hp -= dmg;
    this.hitFlash = 0.1;
    if (this.hp <= 0) this.dead = true;
  }

  update(dt, platforms, player, enemyBullets) {
    const phys = CONFIG.physics;
    const dx = player.centerX - this.centerX;
    const dy = player.centerY - this.centerY;
    const dist = Math.hypot(dx, dy);
    this.facing = dx < 0 ? -1 : 1;
    if (this.hitFlash > 0) this.hitFlash -= dt;
    if (this.touchCd > 0) this.touchCd -= dt;

    if (this.type === 'rusher') {
      this.vx = Math.sign(dx) * this.cfg.speed;
    } else if (this.type === 'gunner') {
      // 保持中等距离：太近后退，太远靠近
      if (dist < this.cfg.range * 0.5) this.vx = -Math.sign(dx) * this.cfg.speed;
      else if (dist > this.cfg.range) this.vx = Math.sign(dx) * this.cfg.speed;
      else this.vx = 0;
      this._tryShoot(dt, dx, dy, dist, this.cfg.range, enemyBullets);
    } else if (this.type === 'boss') {
      this.vx = Math.sign(dx) * this.cfg.speed;
      this._tryShoot(dt, dx, dy, dist, 9999, enemyBullets, true);
    }

    // 重力
    this.vy += phys.gravity * dt;
    if (this.vy > phys.maxFallSpeed) this.vy = phys.maxFallSpeed;

    // 移动 + 碰撞
    this.x += this.vx * dt;
    this._resolveH(platforms);
    this.onGround = false;
    this.y += this.vy * dt;
    this._resolveV(platforms);

    // 世界边界
    if (this.x < 0) this.x = 0;
    if (this.x + this.w > CONFIG.world.width) this.x = CONFIG.world.width - this.w;
    // 掉出地图判死
    if (this.y > CONFIG.canvas.height + 200) this.dead = true;
  }

  _tryShoot(dt, dx, dy, dist, range, enemyBullets, isBoss) {
    this.fireCd -= dt;
    if (dist > range || this.fireCd > 0) return;
    this.fireCd = 1 / this.cfg.fireRate;
    const baseAngle = Math.atan2(dy, dx);
    const spec = { speed: this.cfg.bulletSpeed, radius: 5, lifetime: 2.2, damage: this.cfg.bulletDamage, color: isBoss ? '#ff5252' : '#e040fb' };
    if (isBoss) {
      // 三连扇形弹幕
      for (const off of [-0.22, 0, 0.22]) enemyBullets.push(new Bullet(this.centerX, this.centerY, baseAngle + off, spec, true));
    } else {
      enemyBullets.push(new Bullet(this.centerX, this.centerY, baseAngle, spec, true));
    }
  }

  _resolveH(platforms) {
    for (const pl of platforms) {
      if (this._overlaps(pl)) {
        if (this.vx > 0) this.x = pl.x - this.w;
        else if (this.vx < 0) this.x = pl.x + pl.w;
        this.vx = 0;
      }
    }
  }

  _resolveV(platforms) {
    for (const pl of platforms) {
      if (this._overlaps(pl)) {
        if (this.vy > 0) { this.y = pl.y - this.h; this.onGround = true; }
        else if (this.vy < 0) this.y = pl.y + pl.h;
        this.vy = 0;
      }
    }
  }

  _overlaps(r) {
    return this.x < r.x + r.w && this.x + this.w > r.x &&
           this.y < r.y + r.h && this.y + this.h > r.y;
  }

  draw(ctx, cameraX) {
    const sx = this.x - cameraX;
    if (sx > CONFIG.canvas.width + 60 || sx + this.w < -60) return;
    const sprite = Sprites.cache[this.type];
    ctx.drawImage(sprite, sx, this.y, this.w, this.h);
    // 受击闪白
    if (this.hitFlash > 0) {
      ctx.globalAlpha = 0.6; ctx.fillStyle = '#fff';
      ctx.fillRect(sx, this.y, this.w, this.h); ctx.globalAlpha = 1;
    }
    // 血条（非满血才显示）
    if (this.hp < this.maxHp) {
      const bw = this.w, r = Math.max(0, this.hp / this.maxHp);
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(sx, this.y - 8, bw, 4);
      ctx.fillStyle = this.type === 'boss' ? '#ff3b3b' : '#7CFC00';
      ctx.fillRect(sx, this.y - 8, bw * r, 4);
    }
  }
}
