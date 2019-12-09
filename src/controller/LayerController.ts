import { fabric } from 'fabric';
import { 
  CANVAS_MAX_WIDTH, CANVAS_MAX_HEIGHT, CROP_STYLE,
  CanvasEditMode, CANVAS_PADDING, 
  CANVAS_INIT_WIDTH, CANVAS_INIT_HEIGHT, CROP_ZONE_ID,
} from '../const';
import { numbers, arrays, generateUuid, asyncs } from 'util-kit';
import Cropzone from '../crop/cropzone';
import Cropper from './cropper';
const { timeout } = asyncs;


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

  cropper: Cropper;

  cropzone: any = null;


  constructor(cmp: any) {
    this.cmp = cmp;
    const node = document.createElement('canvas');
    node.width = CANVAS_INIT_WIDTH;
    node.height = CANVAS_INIT_HEIGHT;
    fabric.enableGLFiltering = true;
    this.fCanvas = new fabric.Canvas(node, {
      preserveObjectStacking: true,
      enableRetinaScaling: false,
      containerClass: 'image-editor-canvas-container',
    });
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.padding = 5;
    this.fCanvas.on('selected', () => {
      console.log('canvas selected');
      this.update();
    });
    this.fCanvas.on('mouse:up', () => {
      console.log('canvas mouse up');
      this.cmp.forceUpdate();
    });
    this.fCanvas.on('object:modified', () => {
      this.cmp.forceUpdate();
    })

    this.cropper = new Cropper(this.fCanvas);
    this.editMode = CanvasEditMode.Pan;
    (window as any)._c = this.fCanvas;
  }

  registerContainer(container) {
    this.container = container;
  }


  addImage(imageEle, filename) {
    const uid = generateUuid();

    const oImg = new fabric.Image(imageEle, { name: filename, uid: uid});   
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
      if (this.editMode === CanvasEditMode.Crop) {
        return;
      }

      this.cmp.forceUpdate();
    });
    oImg.on('mouse:up', () => {

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
    if (typeof scale !== 'number') {
      return;
    }
    const pixelWidth = this.fCanvas.getWidth();
    const pixelHeight = this.fCanvas.getHeight();
    this.scale = scale;
    this.fCanvas._setCssDimension('width', `${pixelWidth * this.scale}px`);
    this.fCanvas._setCssDimension('height', `${pixelHeight * this.scale}px`); 
  }


  getAllLayers() {
    const objects = this.fCanvas.getObjects() || [];
    return objects.filter(item => item.type === 'image');

  }

  delete(item) {
    this.fCanvas.remove(item);
  }

  getActiveObject() {
    return this.fCanvas.getActiveObject();
  }

  setActiveObject(item) {
    this.fCanvas.discardActiveObject();
    this.fCanvas.setActiveObject(item)
  }


  setEditMode(mode) {
    const prevMode = this.editMode;
    if (prevMode === mode) {
      return;
    }

    this.editMode = mode;

    if (mode === CanvasEditMode.Crop) {
      this.cropper.start();    
    } else {
      this.cropper.end();
    }


    this.update();
  }


  


  getSize() {
    const width = this.fCanvas.getWidth();
    const height = this.fCanvas.getHeight();
    return [width, height];
  }

  getZoom() {
    return this.fCanvas.getZoom();
  }

  changeDimension(type, val) {
    this.fCanvas.setDimensions({[type]: val});
    this.setScale(this.scale);
    this.update();
  }


  update = () => {
    this.fCanvas.renderAll();
    this.cmp.forceUpdate();
  }

  getCropperParam() {
    return this.cropper.getCropperParam();
  }

  setCropperParam() {
    const cropzone = this.cropper.cropzone;
  }


  doCropAction() {
    const { left, top, width, height } = this.cropper.getCropperParam();

    this.fCanvas.forEachObject((obj) => {
      const originLeft = obj.left;
      const originTop = obj.top;

      obj.set({
        left: originLeft - left,
        top: originTop - top,
      })
    })

    this.fCanvas.setDimensions({
      width: width,
      height: height,
    });

    

    this.update();

    this.setScale(this.scale);
    this.cropper.end();
    this.cropper.start();

  }

  exportImage() {

    const canvasWidth = this.fCanvas.getWidth();
    const canvasHeight = this.fCanvas.getHeight();
    const canvas = document.createElement('canvas');
    const fCanvas = new fabric.StaticCanvas(canvas, {
      preserveObjectStacking: true,
      enableRetinaScaling: false,
    });
    fCanvas.setDimensions({width: canvasWidth, height: canvasHeight});

    (window as any).tmpC = fCanvas;

    const data = this.fCanvas.toJSON();

    return new Promise((resolve, reject) => {
    
      fCanvas.loadFromJSON(data, () => {

        // if need crop

        const { left, top, width, height } = this.cropper.getCropperParam();

        fCanvas.forEachObject((obj) => {
          const originLeft = obj.left;
          const originTop = obj.top;

          obj.set({
            left: originLeft - left,
            top: originTop - top,
          })
        });

        fCanvas.setDimensions({
          width: width,
          height: height,
        });

        const objs = fCanvas.getObjects();
        const cropzone = objs.find(item => item.id === CROP_ZONE_ID);
        if (cropzone) {
          fCanvas.remove(cropzone);
        }
        
        const base64 = fCanvas.toDataURL();
        resolve(base64);


      });

    });

    
  }





}

