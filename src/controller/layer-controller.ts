import { fabric } from 'fabric';
import { 
  CANVAS_MAX_WIDTH, CANVAS_MAX_HEIGHT, CROP_STYLE,
  ViewMode, CANVAS_PADDING, 
  CANVAS_INIT_WIDTH, CANVAS_INIT_HEIGHT, CROP_ZONE_ID,
} from '../const';
import { objects, decorators } from 'util-kit';
import { defaultOptions } from '../config/default';
import Cropper from './cropper';
import ImageDocx from '../model/image-docx'


fabric.enableGLFiltering = true;
fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.padding = 2;


export default class LayerController {

  fCanvas: any;
  container: any;
  cmp: any;

  scale: number = 1;
  viewMode: ViewMode;
  cropper: Cropper;
  

  // tmp cache cropzone left/top;

  // config
  options: any = objects.deepClone(defaultOptions);


  // state 
  // whether apply crop
  cropped: boolean = true;
  loading: boolean = false;
  loadingTxt: string = '处理中...';


  // curent image docs
  imageDocx: ImageDocx;
  idocxUid: any;

  constructor(cmp: any, config: any) {
    (window as any)._ctrl = this;

    this.cmp = cmp;  
    objects.mixin(this.options, config);

    this.cropped = this.options.forceCrop;

    const node = document.createElement('canvas');
    node.width = CANVAS_INIT_WIDTH;
    node.height = CANVAS_INIT_HEIGHT;
    
    this.fCanvas = new fabric.Canvas(node, {
      preserveObjectStacking: true,
      enableRetinaScaling: false,
      selection: false,
      containerClass: 'image-editor-canvas-container',
    });
    
    // always show latest state
    this.fCanvas.on('mouse:up', () => {
      console.log('mouse:up');
      this.cmp.forceUpdate();
    });
    
    this.fCanvas.on('object:modified', () => {
      console.log('object modified');
      this.cmp.forceUpdate();
    })

    this.cropper = new Cropper(this.fCanvas);
    this.viewMode = ViewMode.Normal;
    (window as any)._c = this.fCanvas;
  }

  registerContainer(container) {
    this.container = container;
  }

  enableCropper(enable) {
    if (!this.imageDocx) {
      return false;
    }
    this.cropped = enable;
    if (enable) {
      this.addCropzone();
    } else {
      this.setViewMode(ViewMode.Normal);
      // remove action will lose left/top pos
      this.fCanvas.remove(this.cropper.cropzone);
    }
    this.update();
    return true;
  }

  @async('加载中...')
  async loadIdocx(data) {
    this.fCanvas.clear();
    this.imageDocx = new ImageDocx(data);
    this.idocxUid = data.uid;
    await this.imageDocx.build();
    if (!this.imageDocx.region) {
      this.cropped = false;
    } else {
      this.cropped = true;
      // set cropzone
      const {left, top, width, height } = this.imageDocx.region;
      this.cropper.setSize({left, top, width, height});
    }
    for (let i = 0; i < this.imageDocx.layers.length; i++) {
      const docLayer = this.imageDocx.layers[i];
      await this.loadImage(docLayer, this.imageDocx.region);
    }
  }


  @async('加载中...')
  async addImage({url, base64, name,}) {  
    if (!this.imageDocx) {
      this.imageDocx = new ImageDocx({layers: [], region:{}});
    }
    const docLayer = await this.imageDocx.addImageLayer({ url, base64, name});
    await this.loadImage(docLayer, this.imageDocx.region);
  }


  private loadImage(layer, region) {
    return new Promise((resolve, reject) => {
      const { contentBase64, uid, left, top, width, height, vWidth, vHeight, name } = layer;
      fabric.Image.fromURL(contentBase64, (oImg) => {    
        oImg.set({ 
          name, 
          uid,
          lockUniScaling: this.options.imageLockUniScaling,
          lockRotation: this.options.imageLockRotation,
          left,
          top,
          width,
          height,
          scaleX: vWidth / width,
          scaleY: vHeight / height
        });
        oImg.filters = [
          new fabric.Image.filters.Brightness({brightness: 0}),
          new fabric.Image.filters.Contrast({contrast: 0}),
          new fabric.Image.filters.HueRotation({rotation: 0}),
          new fabric.Image.filters.Saturation({saturation: 0}),   
        ];
        this.cropper.setSize({left: region.left, top: region.top, width: region.width, height: region.height});
        this.fCanvas.add(oImg);
        if (this.cropped) {
          this.addCropzone();
        }
        this._fitSize();
        this.update();
        resolve(this);
      });
    })
  }


  addCropzone() {
    const objs = this.fCanvas.getObjects();
    if (objs.length === 0) {
      return;
    } 
    const cropzone = objs.find(item => item === this.cropper.cropzone);
    if (!cropzone) {
      this.fCanvas.add(this.cropper.cropzone);
      // todo recover previor left / top for cropzone
      this.cropper.reset();
    }  
    if (this.viewMode === ViewMode.Crop) {
      this.cropper.activeCropView();
    } else {
      this.cropper.activeNormalView();
    }
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
    this.update();
  }

  setViewMode(mode) {
    const prevMode = this.viewMode;
    if (prevMode === mode) {
      return;
    }
    this.viewMode = mode;
    if (mode === ViewMode.Crop) {
      this.cropper.activeCropView();    
    } else {
      this.cropper.activeNormalView();
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
    this.cropper.setSize({[type]: val});
    this.update();
  }

  @async('合成中...')
  exportImage(): Promise<any> {
    const canvasWidth = this.fCanvas.getWidth();
    const canvasHeight = this.fCanvas.getHeight();
    const canvas = document.createElement('canvas');
    const tmpFCanvas = new fabric.StaticCanvas(canvas, {
      preserveObjectStacking: true,
      enableRetinaScaling: false,
    });
    tmpFCanvas.setDimensions({width: canvasWidth, height: canvasHeight});

    // fixme: image load event is out of control
    // maybe need to clone layer object instead of JSON

    const data = this.fCanvas.toJSON();
    const len = data.objects.length;
    // remove cropper object
    if (this.cropped && len > 0) {
      data.objects = data.objects.slice(0, len - 1);
    }

    return new Promise((resolve, reject) => {
      tmpFCanvas.loadFromJSON(data, () => {
        let { left, top, width, height } = this.cropper.getCropperParam();    
        if (this.cropped) {    
          tmpFCanvas.forEachObject((obj) => {
            const originLeft = obj.left;
            const originTop = obj.top;
            obj.set({
              left: originLeft - left,
              top: originTop - top,
            })
          });
          tmpFCanvas.setDimensions({
            width: width,
            height: height,
          });
        } else {
          width = canvasWidth;
          height = canvasHeight;
        }
    
        tmpFCanvas.renderAll();
        
        // todo need to do sth to make everything is rendered
        setTimeout(() => {
          const base64 = tmpFCanvas.toDataURL();
          resolve({
            base64,
            width,
            height
          });
        }, 1000);
        
      });

    }); 
  }

  save() {
    if (!this.imageDocx) {
      return;
    }
    const layers = this.getAllLayers();
    this.imageDocx.syncCanvasObjects(layers);
    this.imageDocx.syncRegion(this.cropper);
  }

  @async('导出中...')
  async toJSON() {
    if (!this.imageDocx) {
      return undefined;
    }
    this.save();
    const res = await this.imageDocx.toJSON();
    return res;
  }

}




function async(txt: string = '处理中...') {
  return decorators.createDecorator((fn, key) => {
		return function (this: any, ...args: any[]) {
      
      const p = fn.apply(this, args);

      if (p && typeof p.then === 'function') {
        this.loading = true;
        this.loadingTxt = txt;
        this.cmp.forceUpdate();
        p.finally(() => {
          this.loading = false;
          this.update();
        });
      }

      return p;

		};
	});
}
