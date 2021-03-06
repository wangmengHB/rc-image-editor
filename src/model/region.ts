export default class Region {
  left: number = 0;
  top: number = 0;

  // pixel size
  width: number = 0;
  height: number = 0;

  auto: boolean = false;

  // target output size
  // targetWidth: number = 0;
  // targetHeight: number = 0;

  constructor(json) {
    const data = json || {};
    const { x, y, vWidth, vHeight, auto } = data;
    this.left = x || 0;
    this.top = y || 0;
    this.width = vWidth || 0;
    this.height = vHeight || 0;
    this.auto = !!auto;
    if (this.width <= 0 || this.height <= 0) {
      this.auto = true;
    }
  }

  checkSize(width, height) {
    if (this.width <= 0 || this.height <= 0) {
      this.width = width;
      this.height = height;
      this.left = 0;
      this.top = 0;
    }
  }
}
