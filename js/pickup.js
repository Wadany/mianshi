/**
 * pickup.js —— 掉落物（回血 / 弹药），带重力下落与拾取判定
 */
class Pickup {
  constructor(x, y, kind) {
    this.x = x; this.y = y;
    this.kind = kind;          // 'heal' | 'ammo'
    this.size = CONFIG.drop.size;
    this.vy = -180;            // 冒出来一点
    this.life = CONFIG.drop.lifetime;
    this.dead = false;
    this.bob = Math.random() * Math.PI * 2;
  }

  update(dt, platforms) {
    // 落到平台上
    this.vy += CONFIG.physics.gravity * dt;
    this.y += this.vy * dt;
    for (const pl of platforms) {
      if (this.x + this.size > pl.x && this.x < pl.x + pl.w &&
          this.y + this.size > pl.y && this.y + this.size < pl.y + pl.h + 20 && this.vy > 0) {
        this.y = pl.y - this.size; this.vy = 0;
      }
    }
    this.bob += dt * 4;
    this.life -= dt;
    if (this.life <= 0) this.dead = true;
  }

  tryPickup(player) {
    const px = player.x, py = player.y, pw = player.w, ph = player.h;
    if (this.x + this.size > px && this.x < px + pw &&
        this.y + this.size > py && this.y < py + ph) {
      if (this.kind === 'heal') {
        player.hp = Math.min(CONFIG.player.maxHp, player.hp + CONFIG.drop.healAmount);
      } else {
        player.weapon.addAmmo(CONFIG.drop.ammoAmount);
      }
      this.dead = true;
      return true;
    }
    return false;
  }

  draw(ctx, cameraX) {
    const sx = this.x - cameraX;
    if (sx > CONFIG.canvas.width || sx + this.size < 0) return;
    const oy = Math.sin(this.bob) * 3;
    const s = this.size;
    if (this.kind === 'heal') {
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(sx, this.y + oy, s, s);
      ctx.fillStyle = '#fff'; // 十字
      ctx.fillRect(sx + s*0.4, this.y + oy + s*0.2, s*0.2, s*0.6);
      ctx.fillRect(sx + s*0.2, this.y + oy + s*0.4, s*0.6, s*0.2);
    } else {
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(sx, this.y + oy, s, s);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('A', sx + s*0.28, this.y + oy + s*0.72);
    }
  }
}
