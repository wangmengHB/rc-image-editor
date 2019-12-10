import { fabric } from 'fabric';
import { 
  CANVAS_MAX_WIDTH, CANVAS_MAX_HEIGHT, CROP_STYLE,
  ViewMode, CANVAS_PADDING, 
  CANVAS_INIT_WIDTH, CANVAS_INIT_HEIGHT, CROP_ZONE_ID,
} from '../const';
import { numbers, arrays, generateUuid, asyncs } from 'util-kit';
import Cropper from './cropper';


fabric.enableGLFiltering = true;
fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.padding = 0;


export default class LayerController {

  fCanvas: any;
  container: any;
  cmp: any;

  scale: number = 1;

  viewMode: ViewMode;

  cropper: Cropper;

  cropzone: any = null;


  // config
  forceCrop: boolean = true;


  constructor(cmp: any, config: any) {
    this.cmp = cmp;
    const { forceCrop } = config;

    this.forceCrop = !!forceCrop;

    const node = document.createElement('canvas');
    node.width = CANVAS_INIT_WIDTH;
    node.height = CANVAS_INIT_HEIGHT;
    
    this.fCanvas = new fabric.Canvas(node, {
      preserveObjectStacking: true,
      enableRetinaScaling: false,
      containerClass: 'image-editor-canvas-container',
    });
    
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
    this.viewMode = ViewMode.Pan;
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
      if (this.viewMode === ViewMode.Crop) {
        return;
      }
      this.cmp.forceUpdate();
    });
    
    (window as any)._o = oImg;
    this.fCanvas.add(oImg);

    // suppose cropper is a rect or a group
    // todo: need to self defined a shape

    const objs = this.fCanvas.getObjects();
    let cropzone = objs.find(item => item === this.cropper.cropzone);
    if (!cropzone) {
      this.fCanvas.add(this.cropper.cropzone);
      cropzone = this.cropper.cropzone;
    }
    cropzone.set({ selectable: false})
    cropzone.bringToFront();
    
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
    this.fCanvas.setActiveObject(item);
    this.fCanvas.renderAll();
  }


  setEditMode(mode) {
    const prevMode = this.viewMode;
    if (prevMode === mode) {
      return;
    }

    this.viewMode = mode;

    if (mode === ViewMode.Crop) {
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

  setCropperParam(type, val) {
    this.cropper.setCropperParam(type, val);
    this.update();
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
        if (this.forceCrop) {
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
          const len = objs.length;

          // suppose last one is cropper object
          if (len > 1) {
            fCanvas.remove(objs[len - 1]);
          }
        }
    
        const base64 = fCanvas.toDataURL();
        resolve(base64);


      });

    });

    
  }





}

