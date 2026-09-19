/**
 * input.js —— 键盘与鼠标输入管理
 * 对外暴露全局 Input 对象，供其他模块读取当前输入状态。
 */
const Input = {
  keys: {},              // 当前按下的键：{ 'a': true, ... }
  mouse: { x: 700, y: 300 }, // 鼠标在画布内的坐标（默认朝右前方，避免未移动鼠标时朝左上）
  mouseDown: false,      // 左键是否按住

  init(canvas) {
    // 键盘
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      // 阻止空格/方向键滚动页面
      if ([' ', 'arrowup', 'arrowdown'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // 鼠标位置（换算到画布内部坐标，兼容 CSS 缩放）
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      this.mouse.x = (e.clientX - rect.left) * scaleX;
      this.mouse.y = (e.clientY - rect.top) * scaleY;
    });

    // 鼠标左键
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.mouseDown = true;
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouseDown = false;
    });

    // 屏蔽右键菜单，方便以后用右键
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  },

  // 便捷查询
  isDown(...keys) {
    return keys.some((k) => this.keys[k]);
  },
};
