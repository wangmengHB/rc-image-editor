
import { defaultCropzone } from '../config/default';
import { objects } from 'util-kit';


export default class Cropzone {

  left: number = 0;
  top: number = 0;

  // pixel size
  width: number = 0;
  height: number = 0;

  // target output size
  vWidth: number = 0;
  vHeight: number = 0;


  constructor(json ) {
    const data = json || objects.deepClone(defaultCropzone);
    const { x , y, vWidth, vHeight} = data;
    this.left = x;
    this.top = y;
    this.width = vWidth;
    this.height = vHeight;
    this.vWidth = vWidth;
    this.vHeight = vHeight;
  }

  checkSize(width, height) {
    if (this.vWidth <= 0 || this.vHeight <= 0) {
      this.vWidth = width;
      this.vHeight = height;
    }
  }


  toJSON() {

  }







}
