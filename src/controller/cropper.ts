import { 
  CANVAS_MAX_WIDTH, CANVAS_MAX_HEIGHT, CROP_STYLE,
  CanvasEditMode, CANVAS_PADDING 
} from '../const';
import { fabric } from 'fabric';
import { numbers, arrays } from 'util-kit';

const { mapArrayOrNot } = arrays;


export default class Crop {

  fCanvas: any;

  width: 0;

  height: 0;

  cropzone: any = null;


  constructor(fCanvas) {
    this.fCanvas = fCanvas;
    this.width = fCanvas.getWidth();
    this.height = fCanvas.getHeight();

    this.cropzone = new fabric.Rect({
      left: 0,
      top: 0,
      width: this.width,
      height: this.height,
      fill: 'transparent',
      hasRotatingPoint: false,
      hasBorders: true,
      lockScalingFlip: true,
      lockRotation: true,
      lineWidth: 10,
      cornerSize: 24,
      cornerStrokeColor: "#000",
      cornerColor: "#AAA",
    });

    (window as any)._cropzone = this.cropzone;

  }

  alwaysShowCropzone = () => {
    console.log('leave');

    if (this.cropzone) {
      this.cropzone.bringToFront();
      this.fCanvas.setActiveObject(this.cropzone);
    }
     
  }


  start() {

    this.fCanvas.remove(this.cropzone);

    this.fCanvas.forEachObject(function (obj) {
      // {@link http://fabricjs.com/docs/fabric.Object.html#evented}
      obj.evented = false;
    });

    
    const totalWidth = this.fCanvas.getWidth();
    const totalHeight = this.fCanvas.getHeight();
    this.cropzone.set({
      width: totalWidth,
      height: totalHeight,
    });
    this.cropzone.scale(1);
    console.log('totalWidth', totalWidth);




    
    this.fCanvas.discardActiveObject();
    
    

    let presetRatio = 1.333;

    

    this.fCanvas.add(this.cropzone);
    this.fCanvas.setActiveObject(this.cropzone);

    

    this.fCanvas.on('selection:cleared', this.alwaysShowCropzone);

    this.fCanvas.selection = false;


    this.fCanvas.renderAll();

    



  }

  end() {
    this.fCanvas.off('selection:cleared', this.alwaysShowCropzone);
    this.fCanvas.remove(this.cropzone);

    this.fCanvas.selection = true;
    this.fCanvas.defaultCursor = 'default';
    this.fCanvas.forEachObject(function (obj) {
      // {@link http://fabricjs.com/docs/fabric.Object.html#evented}
      obj.evented = true;
    });
    
  }


  /**
   * Set a cropzone square
   * @param {number} presetRatio - preset ratio
   * @returns {{left: number, top: number, width: number, height: number}}
   * @private
   */
  _getPresetCropSizePosition(presetRatio) {
    
    const originalWidth = this.fCanvas.getWidth();
    const originalHeight = this.fCanvas.getHeight();

    const standardSize = (originalWidth >= originalHeight) ? originalWidth : originalHeight;
    const getScale = (value, orignalValue) => (value > orignalValue) ? orignalValue / value : 1;

    let width = standardSize * presetRatio;
    let height = standardSize;

    const scaleWidth = getScale(width, originalWidth);
    [width, height] = mapArrayOrNot([width, height], sizeValue => sizeValue * scaleWidth) as number[];

    const scaleHeight = getScale(height, originalHeight);
    [width, height] = mapArrayOrNot([width, height], sizeValue => sizeValue * scaleHeight) as number[];

    return {
        top: (originalHeight - height) / 2,
        left: (originalWidth - width) / 2,
        width,
        height
    };
  }


  getCropperParam() {
    const cropzone = this.cropzone;
    const { left, top, width, height, scaleX, scaleY} = cropzone;

    return {
      left: Math.floor(left),
      top: Math.floor(top),
      width: Math.floor(width * scaleX),
      height: Math.floor(height * scaleY),
    };

  }


  doCropAction() {

  }
  

  




}