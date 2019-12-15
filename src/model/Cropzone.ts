
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
    const data = json || {};
    const { x , y, vWidth, vHeight} = data;
    this.left = x || 0;
    this.top = y || 0;
    this.width = vWidth || 0;
    this.height = vHeight || 0;
    this.vWidth = vWidth || 0;
    this.vHeight = vHeight || 0;
  }

  checkSize(width, height) {
    if (this.vWidth <= 0 || this.vHeight <= 0) {
      this.vWidth = width;
      this.vHeight = height;
      this.width = width;
      this.height = height;
    }
  }


  toJSON() {

  }







}
