/**
 * level.js —— 关卡数据（地图扩大 5 倍：9600 宽）
 * 冒险感布局：起伏地面段 + 大量跳跃平台 + 终点旗帜。
 * 同时负责多层视差背景（天空/山脉/云/树）与地块贴图绘制。
 */
const Level = {
  platforms: [],
  decorations: { clouds: [], mountains: [], trees: [] },
  goalX: 0,
  spawnPoints: [],   // 敌人出生点 {x, y, type}

  build() {
    const H = CONFIG.canvas.height;
    const W = CONFIG.world.width;
    const groundY = H - 48;
    this.platforms = [];
    this.spawnPoints = [];

    // --- 地面：分段，中间留几个坑增加冒险感 ---
    const gaps = [[1500,1660],[3200,3420],[5100,5320],[7000,7160],[8300,8460]];
    let cursor = 0;
    const segEnds = [...gaps.map(g=>g[0]), W].sort((a,b)=>a-b);
    let gi = 0;
    let x = 0;
    while (x < W) {
      const gap = gaps[gi];
      if (gap && x >= gap[0]) { x = gap[1]; gi++; continue; }
      const end = gap ? gap[0] : W;
      this.platforms.push({ x, y: groundY, w: end - x, h: 48, ground: true });
      x = end;
      if (!gap) break;
    }

    // --- 跳跃平台（横跨整张地图，高低错落）---
    const P = (x,y,w) => this.platforms.push({ x, y, w, h: 20 });
    const layout = [
      [300,400,150],[560,320,140],[820,250,150],[1080,330,160],
      [1560,360,120],[1760,280,150],[2020,360,160],[2300,300,140],[2560,240,150],[2860,340,180],
      [3260,320,140],[3500,250,150],[3760,350,160],[4040,280,150],[4320,360,180],[4640,300,150],
      [5160,340,120],[5360,270,150],[5640,360,160],[5920,290,150],[6220,350,180],[6540,280,160],
      [7040,330,130],[7260,260,150],[7540,360,160],[7820,290,150],[8060,240,150],
      [8500,360,180],[8800,300,160],[9080,250,180],
    ];
    layout.forEach(([px,py,pw]) => P(px,py,pw));

    // --- 终点旗帜 ---
    this.goalX = W - 160;

    // --- 敌人出生点：沿途分布，末端 Boss ---
    const S = (x,y,type) => this.spawnPoints.push({ x, y, type });
    S(1150, groundY-40,'rusher'); S(1350,290,'gunner'); S(1850,240,'rusher');
    S(2340,260,'gunner'); S(2900,300,'rusher'); S(3300,280,'gunner');
    S(3820,240,'rusher'); S(4360,320,'gunner'); S(4700,260,'rusher');
    S(5220,230,'gunner'); S(5700,320,'rusher'); S(6260,310,'gunner');
    S(6600,240,'rusher'); S(7100,290,'gunner'); S(7600,320,'rusher');
    S(8100,200,'gunner'); S(8560,320,'rusher');
    S(9150, groundY-110,'boss');

    // --- 装饰（视差层）---
    this.decorations.clouds = [];
    for (let i = 0; i < 24; i++) this.decorations.clouds.push({ x: rand(0,W), y: rand(20,180), s: rand(0.5,1.1) });
    this.decorations.mountains = [];
    for (let i = 0; i < 18; i++) this.decorations.mountains.push({ x: i*560 + rand(-80,80) });
    this.decorations.trees = [];
    for (let i = 0; i < 40; i++) this.decorations.trees.push({ x: rand(0,W), scale: rand(0.7,1.3) });

    return this.platforms;
  },

  // 视差背景：越远的层移动越慢
  drawBackground(ctx, cameraX) {
    const w = CONFIG.canvas.width, h = CONFIG.canvas.height;
    // 天空渐变
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, CONFIG.world.bgColorTop);
    g.addColorStop(1, CONFIG.world.bgColorBottom);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

    // 山脉（视差 0.3）
    const m = Sprites.cache.mountain;
    this.decorations.mountains.forEach(mt => {
      const sx = mt.x - cameraX * 0.3;
      if (sx > -600 && sx < w) ctx.drawImage(m, sx, h - 300);
    });
    // 云（视差 0.5）
    const cl = Sprites.cache.cloud;
    this.decorations.clouds.forEach(c => {
      const sx = c.x - cameraX * 0.5;
      const wrapped = ((sx % (w+300)) + (w+300)) % (w+300) - 150;
      ctx.globalAlpha = 0.9;
      ctx.drawImage(cl, wrapped, c.y, cl.width*c.s, cl.height*c.s);
      ctx.globalAlpha = 1;
    });
  },

  // 树（视差 0.85，接近前景）
  drawTrees(ctx, cameraX) {
    const t = Sprites.cache.tree, h = CONFIG.canvas.height;
    this.decorations.trees.forEach(tr => {
      const sx = tr.x - cameraX * 0.85;
      if (sx > -80 && sx < CONFIG.canvas.width)
        ctx.drawImage(t, sx, h - 48 - t.height*tr.scale + 8, t.width*tr.scale, t.height*tr.scale);
    });
  },

  // 地块贴图：地面带草顶，平台带草顶 + 泥土纹理
  drawPlatforms(ctx, cameraX) {
    for (const pl of this.platforms) {
      const sx = pl.x - cameraX;
      if (sx > CONFIG.canvas.width || sx + pl.w < 0) continue;
      // 主体
      ctx.fillStyle = pl.ground ? CONFIG.world.groundColor : CONFIG.world.platformColor;
      ctx.fillRect(sx, pl.y, pl.w, pl.h);
      // 草顶
      ctx.fillStyle = pl.ground ? CONFIG.world.groundTop : CONFIG.world.platformTop;
      ctx.fillRect(sx, pl.y, pl.w, 6);
      // 泥土纹理点
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      for (let i = sx + 8; i < sx + pl.w; i += 26) {
        ctx.fillRect(i, pl.y + 10, 3, 3);
        ctx.fillRect(i + 12, pl.y + 16, 3, 3);
      }
    }
  },

  // 终点旗帜
  drawGoal(ctx, cameraX) {
    const sx = this.goalX - cameraX;
    if (sx > CONFIG.canvas.width || sx < -60) return;
    const baseY = CONFIG.canvas.height - 48;
    ctx.fillStyle = '#ddd'; ctx.fillRect(sx, baseY - 130, 6, 130); // 旗杆
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath(); ctx.moveTo(sx+6, baseY-130); ctx.lineTo(sx+56, baseY-112); ctx.lineTo(sx+6, baseY-94); ctx.closePath(); ctx.fill();
  },
};
