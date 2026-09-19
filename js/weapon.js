/**
 * weapon.js —— 子弹与武器（M1 只做默认手枪 + 直线子弹）
 */

class Bullet {
  constructor(x, y, angle) {
    const w = CONFIG.weapon;
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * w.bulletSpeed;
    this.vy = Math.sin(angle) * w.bulletSpeed;
    this.radius = w.bulletRadius;
    this.life = w.bulletLifetime;
    this.dead = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    // 超时或飞出世界即销毁
    if (this.life <= 0 || this.x < -50 || this.x > CONFIG.world.width + 50 ||
        this.y < -50 || this.y > CONFIG.canvas.height + 50) {
      this.dead = true;
    }
  }

  draw(ctx, cameraX) {
    ctx.beginPath();
    ctx.arc(this.x - cameraX, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = CONFIG.weapon.bulletColor;
    ctx.fill();
  }
}

/**
 * 武器：管理射速节流，负责生成子弹。
 */
class Weapon {
  constructor() {
    this.cooldown = 0; // 距下次可开火的剩余时间(s)
  }

  update(dt) {
    if (this.cooldown > 0) this.cooldown -= dt;
  }

  // 尝试开火，返回新生成的子弹数组（可能为空）
  tryFire(originX, originY, angle) {
    if (this.cooldown > 0) return [];
    this.cooldown = 1 / CONFIG.weapon.fireRate;
    return [new Bullet(originX, originY, angle)];
  }
}
