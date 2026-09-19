/**
 * config.js —— 集中管理所有可调数值
 * 调参改这里即可，不用翻其他文件。
 */
const CONFIG = {
  // 画布
  canvas: {
    width: 960,
    height: 540,
  },

  // 物理
  physics: {
    gravity: 2000,        // 重力加速度 px/s^2
    maxFallSpeed: 1200,   // 最大下落速度
  },

  // 玩家
  player: {
    width: 32,
    height: 48,
    color: '#f5c518',
    moveSpeed: 320,       // 水平移动速度 px/s
    jumpSpeed: 780,       // 起跳初速度 px/s
    maxHp: 100,
    spawnX: 120,
    spawnY: 300,
    coyoteTime: 0.1,      // 离开平台后仍可跳的宽限时间(s)
    invincibleTime: 0.6,  // 受伤后无敌时间(s)

    // 变身形态（左 Shift 切换）：放大一倍、变圆、开枪有后坐力推飞
    blob: {
      scale: 2,             // 尺寸放大倍数
      color: '#4fc3f7',     // 变身后的颜色（圆形）
      recoil: 900,          // 后坐力冲量大小 px/s，方向与射击方向相反
      recoilMaxSpeed: 1400, // 后坐力叠加后速度上限，防止被推飞太夸张
    },
  },

  // 武器表（数字键 1/2/3 切换，或拾取）
  weapons: {
    pistol: {
      name: '手枪', key: '1', color: '#ffd966',
      fireRate: 5, bulletSpeed: 950, bulletRadius: 4,
      bulletLifetime: 1.2, damage: 25, pellets: 1, spread: 0, ammo: Infinity,
    },
    smg: {
      name: '冲锋枪', key: '2', color: '#9be7ff',
      fireRate: 12, bulletSpeed: 1050, bulletRadius: 3,
      bulletLifetime: 1.0, damage: 12, pellets: 1, spread: 0.05, ammo: 180,
    },
    shotgun: {
      name: '霰弹枪', key: '3', color: '#ff9d5c',
      fireRate: 1.4, bulletSpeed: 850, bulletRadius: 4,
      bulletLifetime: 0.5, damage: 14, pellets: 7, spread: 0.35, ammo: 40,
    },
  },

  // 敌人
  enemies: {
    rusher: { name: '冲锋兵', w: 30, h: 40, color: '#e94560', hp: 40, speed: 120, touchDamage: 7, touchCd: 0.9, score: 100 },
    gunner: { name: '枪手', w: 30, h: 44, color: '#c86bfa', hp: 30, speed: 70, range: 520, fireRate: 0.9, bulletSpeed: 480, bulletDamage: 7, score: 150 },
    boss:   { name: 'BOSS', w: 90, h: 110, color: '#ff3b3b', hp: 900, speed: 90, touchDamage: 18, touchCd: 0.8, fireRate: 1.4, bulletSpeed: 460, bulletDamage: 10, score: 1000 },
  },

  // 掉落
  drop: {
    chance: 0.4,          // 敌人死亡掉落概率
    healAmount: 25,
    ammoAmount: 45,
    size: 22,
    lifetime: 12,         // 掉落物存活秒数
  },

  // 世界/关卡（地图扩大 5 倍：1920 -> 9600）
  world: {
    width: 9600,
    height: 540,
    bgColorTop: '#12203f',
    bgColorBottom: '#0f3460',
    groundColor: '#3a2e28',
    groundTop: '#5a7d3c',     // 草地顶层
    platformColor: '#6b4f3a',
    platformTop: '#7fae4e',
  },
};

// 通用工具：把 v 限制在 [min, max] 区间
function clamp(v, min, max) {
  return v < min ? min : (v > max ? max : v);
}
function rand(min, max) { return min + Math.random() * (max - min); }
