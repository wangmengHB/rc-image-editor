import { 
  CANVAS_MAX_WIDTH, CANVAS_MAX_HEIGHT, CROP_STYLE,
  ViewMode, CANVAS_PADDING, CROP_ZONE_ID
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
      left: 20,
      top: 20,
      width: this.width - 40,
      height: this.height - 40,
      fill: 'transparent',
      hasRotatingPoint: false,
      hasBorders: true,
      lockScalingFlip: true,
      lockRotation: true,
      strokeWidth: 5,
      stroke: 'rgba(255,0,0,1)',
      cornerSize: 24,
      cornerStrokeColor: "#000",
      cornerColor: "#aaaaaa",
    });
    this.cropzone.perPixelTargetFind = true;

    (window as any)._cropzone = this.cropzone;

  }

  alwaysShowCropzone = () => {
    const objects = this.fCanvas.getObjects();
    if (objects.indexOf(this.cropzone) > -1) {
      this.cropzone.bringToFront();
      this.fCanvas.setActiveObject(this.cropzone);
    }     
  }


  activeCropView() {
    this.fCanvas.remove(this.cropzone);
    this.fCanvas.forEachObject(function (obj) {
      // {@link http://fabricjs.com/docs/fabric.Object.html#evented}
      obj.evented = false;
    });
    this.fCanvas.discardActiveObject();
    this.fCanvas.add(this.cropzone);
    this.cropzone.perPixelTargetFind = false;
    this.cropzone.set({ selectable: true});
    this.fCanvas.setActiveObject(this.cropzone);
    this.fCanvas.on('selection:cleared', this.alwaysShowCropzone);  
    this.fCanvas.renderAll();
  }

  activeNormalView() {
    this.fCanvas.off('selection:cleared', this.alwaysShowCropzone);
    this.fCanvas.defaultCursor = 'default';
    this.fCanvas.forEachObject(function (obj) {
      // {@link http://fabricjs.com/docs/fabric.Object.html#evented}
      obj.evented = true;
    });
    this.cropzone.perPixelTargetFind = true;
    this.fCanvas.discardActiveObject();
    this.cropzone.bringToFront();
    this.cropzone.set({ selectable: false});
    this.fCanvas.renderAll();  
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

  setCropperParam(type, val) {
    const { left, top, width, height } = this.getCropperParam();
    this.cropzone.set({
      left, top, width, height, [type]: val
    });
    this.cropzone.scale(1);
  }

  




}