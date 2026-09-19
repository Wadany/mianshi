/**
 * sprites.js —— 程序化贴图生成
 * 用离屏 canvas 预渲染精细图形，避免依赖外部素材，风格统一、加载快、无版权问题。
 * 对外暴露全局 Sprites 对象。
 */
const Sprites = {
  cache: {},

  // 新建一个离屏 canvas 并返回其 2d ctx
  _make(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return { c, ctx: c.getContext('2d') };
  },

  init() {
    this.cache.player = this._player();
    this.cache.blob = this._blob();
    this.cache.rusher = this._rusher();
    this.cache.gunner = this._gunner();
    this.cache.boss = this._boss();
    this.cache.cloud = this._cloud();
    this.cache.mountain = this._mountain();
    this.cache.tree = this._tree();
  },

  // 主角：带盔甲质感的小战士
  _player() {
    const { c, ctx } = this._make(32, 48);
    // 身体
    ctx.fillStyle = '#f5c518';
    ctx.fillRect(6, 14, 20, 26);
    // 头
    ctx.fillStyle = '#ffe08a';
    ctx.fillRect(9, 2, 14, 14);
    // 护目镜
    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(9, 6, 14, 4);
    // 腿
    ctx.fillStyle = '#3d5a80';
    ctx.fillRect(7, 40, 7, 8);
    ctx.fillRect(18, 40, 7, 8);
    // 胸甲高光
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(8, 16, 4, 20);
    return c;
  },

  // 变身圆形态：发光能量球
  _blob() {
    const s = 96;
    const { c, ctx } = this._make(s, s);
    const g = ctx.createRadialGradient(s/2, s/2, 6, s/2, s/2, s/2);
    g.addColorStop(0, '#d6f5ff');
    g.addColorStop(0.4, '#4fc3f7');
    g.addColorStop(1, '#1976d2');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(s/2, s/2, s/2 - 2, 0, Math.PI*2); ctx.fill();
    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.arc(s*0.36, s*0.34, s*0.12, 0, Math.PI*2); ctx.fill();
    return c;
  },

  _rusher() {
    const e = CONFIG.enemies.rusher;
    const { c, ctx } = this._make(e.w, e.h);
    ctx.fillStyle = e.color;
    ctx.fillRect(2, 6, e.w-4, e.h-6);
    ctx.fillStyle = '#7a1226'; // 装甲暗部
    ctx.fillRect(2, e.h-10, e.w-4, 4);
    // 眼
    ctx.fillStyle = '#fff';
    ctx.fillRect(7, 12, 5, 5); ctx.fillRect(e.w-12, 12, 5, 5);
    ctx.fillStyle = '#000';
    ctx.fillRect(9, 14, 2, 3); ctx.fillRect(e.w-10, 14, 2, 3);
    return c;
  },

  _gunner() {
    const e = CONFIG.enemies.gunner;
    const { c, ctx } = this._make(e.w, e.h);
    ctx.fillStyle = e.color;
    ctx.fillRect(3, 4, e.w-6, e.h-4);
    ctx.fillStyle = '#5b2a86';
    ctx.fillRect(3, 4, e.w-6, 6); // 头盔
    ctx.fillStyle = '#ffe08a';
    ctx.fillRect(9, 14, e.w-18, 6); // 面罩缝
    return c;
  },

  _boss() {
    const e = CONFIG.enemies.boss;
    const { c, ctx } = this._make(e.w, e.h);
    // 主体
    const g = ctx.createLinearGradient(0, 0, 0, e.h);
    g.addColorStop(0, '#ff6b6b'); g.addColorStop(1, '#8b0000');
    ctx.fillStyle = g;
    ctx.fillRect(4, 8, e.w-8, e.h-8);
    // 尖刺头顶
    ctx.fillStyle = '#3a0000';
    for (let i = 0; i < 5; i++) {
      const x = 10 + i * (e.w-20)/4;
      ctx.beginPath(); ctx.moveTo(x, 8); ctx.lineTo(x+9, 8); ctx.lineTo(x+4, -6); ctx.closePath(); ctx.fill();
    }
    // 眼
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(e.w*0.28, 28, 14, 12); ctx.fillRect(e.w*0.58, 28, 14, 12);
    ctx.fillStyle = '#000';
    ctx.fillRect(e.w*0.32, 32, 6, 6); ctx.fillRect(e.w*0.62, 32, 6, 6);
    return c;
  },

  _cloud() {
    const { c, ctx } = this._make(160, 70);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    [[40,40,32],[80,32,40],[120,40,30],[70,48,34],[100,48,30]].forEach(([x,y,r]) => {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
    });
    return c;
  },

  _mountain() {
    const { c, ctx } = this._make(600, 300);
    const g = ctx.createLinearGradient(0, 0, 0, 300);
    g.addColorStop(0, '#4a5a7a'); g.addColorStop(1, '#2a3550');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(0, 300);
    ctx.lineTo(120, 90); ctx.lineTo(240, 200); ctx.lineTo(360, 60);
    ctx.lineTo(480, 180); ctx.lineTo(600, 110); ctx.lineTo(600, 300);
    ctx.closePath(); ctx.fill();
    // 雪顶
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath(); ctx.moveTo(360, 60); ctx.lineTo(340, 90); ctx.lineTo(382, 92); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(120, 90); ctx.lineTo(104, 118); ctx.lineTo(140, 120); ctx.closePath(); ctx.fill();
    return c;
  },

  _tree() {
    const { c, ctx } = this._make(70, 110);
    ctx.fillStyle = '#5b3a21';
    ctx.fillRect(30, 60, 12, 50); // 树干
    ctx.fillStyle = '#2f7d32';
    [[35,40,30],[20,55,22],[50,55,22]].forEach(([x,y,r]) => {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
    });
    ctx.fillStyle = '#3fa142';
    ctx.beginPath(); ctx.arc(35, 34, 20, 0, Math.PI*2); ctx.fill();
    return c;
  },
};
