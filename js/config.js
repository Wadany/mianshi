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
    jumpSpeed: 760,       // 起跳初速度 px/s
    maxHp: 100,
    spawnX: 120,
    spawnY: 300,
    coyoteTime: 0.1,      // 离开平台后仍可跳的宽限时间(s)
  },

  // 武器（默认手枪）
  weapon: {
    fireRate: 5,          // 每秒发数
    bulletSpeed: 900,     // 子弹速度 px/s
    bulletRadius: 4,
    bulletColor: '#ffd966',
    bulletLifetime: 1.2,  // 子弹存活时间(s)
    damage: 25,
  },

  // 世界/关卡
  world: {
    width: 1920,          // 关卡总宽（大于画布，支持横向滚动）
    bgColor: '#0f3460',
    groundColor: '#2d4059',
    platformColor: '#3f5277',
  },
};
