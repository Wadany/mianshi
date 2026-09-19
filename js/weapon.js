/**
 * weapon.js —— 子弹与武器（支持手枪/冲锋枪/霰弹枪，多弹丸、散射、弹药）
 */

class Bullet {
  constructor(x, y, angle, spec, fromEnemy) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * spec.speed;
    this.vy = Math.sin(angle) * spec.speed;
    this.radius = spec.radius;
    this.life = spec.lifetime;
    this.damage = spec.damage;
    this.color = spec.color;
    this.fromEnemy = !!fromEnemy;
    this.dead = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    if (this.life <= 0 || this.x < -60 || this.x > CONFIG.world.width + 60 ||
        this.y < -60 || this.y > CONFIG.canvas.height + 60) {
      this.dead = true;
    }
  }

  draw(ctx, cameraX) {
    ctx.beginPath();
    ctx.arc(this.x - cameraX, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    // 拖尾光晕
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(this.x - cameraX, this.y, this.radius + 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

/**
 * 玩家武器：管理当前枪械、射速节流、弹药。
 */
class Weapon {
  constructor() {
    this.keys = Object.keys(CONFIG.weapons); // ['pistol','smg','shotgun']
    this.current = 'pistol';
    this.cooldown = 0;
    // 弹药：手枪无限
    this.ammo = {};
    for (const k of this.keys) this.ammo[k] = CONFIG.weapons[k].ammo;
  }

  get spec() { return CONFIG.weapons[this.current]; }

  switchTo(key) {
    if (CONFIG.weapons[key]) { this.current = key; this.cooldown = 0; }
  }

  switchByNumber(n) {
    for (const k of this.keys) {
      if (CONFIG.weapons[k].key === n) { this.switchTo(k); return; }
    }
  }

  addAmmo(amount) {
    // 给当前非无限武器补弹；否则给冲锋枪补
    const target = this.ammo[this.current] === Infinity ? 'smg' : this.current;
    if (this.ammo[target] !== Infinity) this.ammo[target] += amount;
  }

  update(dt) {
    if (this.cooldown > 0) this.cooldown -= dt;
  }

  tryFire(originX, originY, angle) {
    const s = this.spec;
    if (this.cooldown > 0) return [];
    if (this.ammo[this.current] <= 0) return [];
    this.cooldown = 1 / s.fireRate;
    if (this.ammo[this.current] !== Infinity) this.ammo[this.current]--;

    const bulletSpec = {
      speed: s.bulletSpeed, radius: s.bulletRadius,
      lifetime: s.bulletLifetime, damage: s.damage, color: s.color,
    };
    const out = [];
    for (let i = 0; i < s.pellets; i++) {
      const a = angle + (s.pellets > 1 ? rand(-s.spread, s.spread) : rand(-s.spread, s.spread));
      out.push(new Bullet(originX, originY, a, bulletSpec, false));
    }
    return out;
  }
}
