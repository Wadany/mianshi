/**
 * level.js —— 关卡数据（M1：静态地面 + 几块平台，用于测试跳跃与碰撞）
 * 平台用矩形 {x, y, w, h} 表示。
 */
const Level = {
  // 生成第一关的平台列表
  build() {
    const H = CONFIG.canvas.height;
    const W = CONFIG.world.width;
    return [
      // 地面（贯穿整关底部）
      { x: 0, y: H - 40, w: W, h: 40 },
      // 悬空平台
      { x: 260, y: 400, w: 160, h: 20 },
      { x: 500, y: 320, w: 160, h: 20 },
      { x: 760, y: 250, w: 160, h: 20 },
      { x: 1040, y: 340, w: 200, h: 20 },
      { x: 1360, y: 400, w: 160, h: 20 },
      { x: 1600, y: 300, w: 180, h: 20 },
    ];
  },

  draw(ctx, cameraX, platforms) {
    for (const pl of platforms) {
      // 地面用地面色，其余用平台色
      const isGround = pl.w >= CONFIG.world.width;
      ctx.fillStyle = isGround ? CONFIG.world.groundColor : CONFIG.world.platformColor;
      ctx.fillRect(pl.x - cameraX, pl.y, pl.w, pl.h);
    }
  },
};
