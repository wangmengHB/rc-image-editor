import { fabric } from 'fabric';
import { 
  CANVAS_MAX_WIDTH, CANVAS_MAX_HEIGHT, CROP_STYLE,
  ViewMode, CANVAS_PADDING, 
  CANVAS_INIT_WIDTH, CANVAS_INIT_HEIGHT, CROP_ZONE_ID,
} from '../const';
import { objects, decorators } from 'util-kit';
import { defaultOptions } from '../config/default';
import Cropper from './cropper';
import ImageDocx from '../model/image-docx';
import IdocxJSONList from '../model/idocx-json-list';
import {fakeUrlToBase64, fakeBase64ToUrl, async } from '../util';

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
  

  // for output and preview
  tmpFCanvas: any;
  

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
  idocxList: IdocxJSONList;

  // util
  util = {
    urlToBase64: fakeUrlToBase64,
    base64ToUrl: fakeBase64ToUrl,
  }


  constructor(cmp: any, config: any, util: any) {
    (window as any)._ctrl = this;


    // add to dom for debug.
    // const tmpDiv = document.createElement('div');
    // tmpDiv.style.display = 'none';
    const canvas = document.createElement('canvas');
    // tmpDiv.appendChild(canvas);
    // document.body.appendChild(tmpDiv);
    this.tmpFCanvas = new fabric.StaticCanvas(canvas, {});

    if (util) {
      const { urlToBase64, base64ToUrl} = util;
      if (typeof urlToBase64 === 'function') {
        this.util.urlToBase64 = urlToBase64;
      }
      if (typeof base64ToUrl === 'function') {
        this.util.base64ToUrl = base64ToUrl;
      }
    }

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
    this.imageDocx = new ImageDocx(data, this.util.urlToBase64, this.util.base64ToUrl);
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
    const newIdocx = {
      previewUrl: url || base64,
      layers: [{ 
        contentUrl: url || base64
      }]
    };
    if (
      !this.idocxList || 
      !Array.isArray(this.idocxList.list) ||
      this.idocxList.list.length === 0
    ) {
      
      this.idocxList = new IdocxJSONList([newIdocx]);
      await this.loadIdocx(this.idocxList.list[0]);
      return;
    }
    
    if (!this.imageDocx) {
      this.idocxList.add(newIdocx);
      const len = this.idocxList.list.length;
      await this.loadIdocx(this.idocxList.list[len - 1]);
      return;
    }

    const docLayer = await this.imageDocx.addImageLayer({ url, base64, name});
    await this.loadImage(docLayer, this.imageDocx.region);
  }


  private loadImage(layer, region) {
    return new Promise((resolve, reject) => {
      const { 
        contentBase64, uid, left, top, width, height, 
        scaleX, scaleY, name, filter 
      } = layer;
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
          scaleX: scaleX,
          scaleY: scaleY,
        });
        oImg.filters = [
          new fabric.Image.filters.Brightness({brightness: filter.brightness}),
          new fabric.Image.filters.Contrast({contrast: filter.contrast}),
          new fabric.Image.filters.HueRotation({rotation: filter.hue}),
          new fabric.Image.filters.Saturation({saturation: filter.saturation}),   
        ];
        // oImg.applyFilters();
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
    
    this.tmpFCanvas.clear();
    this.tmpFCanvas.setDimensions({width: canvasWidth, height: canvasHeight});
    const data = this.fCanvas.toJSON();
    const len = data.objects.length;
    // remove cropper object
    if (this.cropped && len > 0) {
      data.objects = data.objects.slice(0, len - 1);
    }

    return new Promise((resolve, reject) => {
      this.tmpFCanvas.loadFromJSON(data, () => {
    
        let { left, top, width, height } = this.cropper.getCropperParam();    
        if (this.cropped) {    
          this.tmpFCanvas.forEachObject((obj) => {
            const originLeft = obj.left;
            const originTop = obj.top;
            obj.set({
              left: originLeft - left,
              top: originTop - top,
            })
          });
          this.tmpFCanvas.setDimensions({
            width: width,
            height: height,
          });
        } else {
          width = canvasWidth;
          height = canvasHeight;
        }

        // tricky way to fix annoy bug in fabric

        const json = this.tmpFCanvas.toJSON();

        this.tmpFCanvas.loadFromJSON(json, () => {
          this.tmpFCanvas.renderAll();

          this.tmpFCanvas.calcOffset();
          this.tmpFCanvas.forEachObject(function(o) {
            o.setCoords();
          });

          setTimeout(() => {
            const base64 = this.tmpFCanvas.toDataURL();
            resolve({
              base64,
              width,
              height
            });
          }, 0);
        });

      });   
    }); 
  }

  syncIdocx() {
    if (!this.imageDocx) {
      return;
    }
    const layers = this.getAllLayers();
    this.imageDocx.syncCanvasObjects(layers);
    this.imageDocx.syncRegion(this.cropper);
  }

  @async('保存中...')
  async toJSON() {
    if (!this.imageDocx) {
      return undefined;
    }
    this.syncIdocx();
    const img = await this.exportImage();
    const json = await this.imageDocx.toJSON();
    const item = {
      ...json,
      previewUrl: img.base64
    }
    return item;
  }

  @async('保存中...')
  async saveCurrentIdocx() {
    const { idocxUid, imageDocx } = this;  
    const currentIndex = this.idocxList.list.findIndex(item => item.uid === idocxUid);
    if (!idocxUid || !imageDocx || currentIndex === -1) {
      return;
    }
    const data = await this.toJSON();    
    this.idocxList.list[currentIndex] = {
      ...this.idocxList.list[currentIndex],
      ...data
    };
    this.cmp.forceUpdate();
    return objects.deepClone(this.idocxList.list[currentIndex]);
  }

}

