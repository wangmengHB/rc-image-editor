import { fabric } from 'fabric';
import { 
  CANVAS_MAX_WIDTH, CANVAS_MAX_HEIGHT, CROP_STYLE,
  CanvasEditMode, CANVAS_PADDING 
} from '../const';
import { numbers, arrays } from 'util-kit';
import Cropzone from '../crop/cropzone';

const { mapArrayOrNot } = arrays;

const DEFAULT_OPTION = {
  top: -10,
  left: -10,
  height: 1,
  width: 1
};


export default class LayerController {

  fCanvas: any;
  container: any;
  cmp: any;

  scale: number = 1;

  editMode: CanvasEditMode;

  cropzone: any = null;


  constructor(cmp: any) {
    this.cmp = cmp;
    const node = document.createElement('canvas');
    this.fCanvas = new fabric.Canvas(node, {preserveObjectStacking: true});
    let webglBackend = new fabric.WebglFilterBackend();
    fabric.filterBackend = fabric.initFilterBackend();
    fabric.filterBackend = webglBackend;
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.padding = 5;
    this.fCanvas.on('selected', () => {
      console.log('canvas selected');
      this.cmp.forceUpdate();
    });
    this.editMode = CanvasEditMode.Pan;
  }

  registerContainer(container) {
    this.container = container;
  }


  addImage(imageEle, filename) {
    const oImg = new fabric.Image(imageEle, { name: filename});   
    const brightnessFilter = new fabric.Image.filters.Brightness({brightness: 0});
    const contrastFilter = new fabric.Image.filters.Contrast({contrast: 0});
    const hueFilter = new fabric.Image.filters.HueRotation({rotation: 0});
    const saturationFilter = new fabric.Image.filters.Saturation({saturation: 0});
    oImg.filters = [
      brightnessFilter,
      contrastFilter,
      hueFilter,
      saturationFilter,
    ];
    oImg.on('selected', () => {
      console.log('image selected');
      this.cmp.forceUpdate();
    });
    oImg.on('mousemove', () => {

      // todo: throttle 
      this.cmp.forceUpdate();
    });
    (window as any)._o = oImg;
    this.fCanvas.add(oImg);
    this._fitSize()
    this.update();
  }

  private _fitSize = () => {
    const imgList = this.getAllLayers();

    const max_image_width = Math.max(...imgList.map((item: any) => item.width));
    const max_image_height = Math.max(...imgList.map((item: any) => item.height));
    const image_aspect = max_image_width / max_image_height;

    const canvasWidth = this.container.clientWidth - CANVAS_PADDING;
    const canvasHeight = this.container.clientHeight - CANVAS_PADDING;
    const canvasAspect = canvasWidth / canvasHeight;

    let zoom = 1;
    if (image_aspect < canvasAspect) {
      zoom = canvasHeight / max_image_height; 
    } else {
      zoom = canvasWidth / max_image_width;
    }
    this.scale = zoom;

    this.fCanvas.setDimensions({
      width: max_image_width,
      height: max_image_height,
    });
    this.update();
    this.fCanvas._setCssDimension('width', `${max_image_width * this.scale}px`);
    this.fCanvas._setCssDimension('height', `${max_image_height * this.scale}px`);
  }

  setScale = (scale) => {
    if (!this.fCanvas || typeof scale !== 'number') {
      return;
    }
    const pixelWidth = this.fCanvas.getWidth();
    const pixelHeight = this.fCanvas.getHeight();
    this.scale = scale;
    this.fCanvas._setCssDimension('width', `${pixelWidth * this.scale}px`);
    this.fCanvas._setCssDimension('height', `${pixelHeight * this.scale}px`); 
  }


  getAllLayers() {
    if (!this.fCanvas) {
      return [];
    }

    const objects = this.fCanvas.getObjects() || [];
    return objects.filter(item => item.type === 'image');

  }

  delete(item) {
    if (!this.fCanvas) {
      return;
    }
    this.fCanvas.remove(item);
  }

  getActiveObject() {
    if (!this.fCanvas) {
      return;
    }
    return this.fCanvas.getActiveObject();
  }

  setActiveObject(item) {
    if (!this.fCanvas) {
      return;
    }
    this.fCanvas.setActiveObject(item)
  }


  setEditMode(mode) {

    this.editMode = mode;
    // todo: sth

    if (mode === CanvasEditMode.Crop) {
      if (!this.cropzone) {
        this.cropzone = new Cropzone(this.fCanvas, {
          left: 0,
          top: 0,
          width: 0.5,
          height: 0.5,
          strokeWidth: 0, // {@link https://github.com/kangax/fabric.js/issues/2860}
          cornerSize: 10,
          cornerColor: 'black',
          fill: 'transparent',
          hasRotatingPoint: false,
          hasBorders: false,
          lockScalingFlip: true,
          lockRotation: true
        }, CROP_STYLE);
      }

      this.fCanvas.discardActiveObject();
      this.fCanvas.selection = false;
      this.fCanvas.remove(this.cropzone);

      let presetRatio = 1.333;

      this.cropzone.set(presetRatio ? this._getPresetCropSizePosition(presetRatio) : DEFAULT_OPTION);

      this.fCanvas.add(this.cropzone);
      this.fCanvas.selection = true;

      this.fCanvas.setActiveObject(this.cropzone);

      (window as any)._cropzone = this.cropzone;

    } else {
      this.fCanvas.remove(this.cropzone);
    }

    this.cmp.forceUpdate();
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


  getSize() {
    if (!this.fCanvas) {
      return [0, 0];
    }
    const width = this.fCanvas.getWidth();
    const height = this.fCanvas.getHeight();
    return [width, height];
  }

  getZoom() {
    if (!this.fCanvas) {
      return;
    }
    return this.fCanvas.getZoom();
  }

  changeDimension(type, val) {
    if (!this.fCanvas) {
      return;
    }

    this.fCanvas.setDimensions({[type]: val});
    this.setScale(this.scale);
    this.update();

  }


  update() {
    if (!this.fCanvas) {
      return;
    }
    this.fCanvas.renderAll();
    this.cmp.forceUpdate();
  }





}

