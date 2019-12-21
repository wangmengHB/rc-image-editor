import { fabric } from 'fabric';
import {
  CANVAS_MAX_WIDTH,
  CANVAS_MAX_HEIGHT,
  ViewMode,
  CANVAS_PADDING,
  CANVAS_INIT_WIDTH,
  CANVAS_INIT_HEIGHT,
  PRECISION_SCENE_RATIO,
} from '../const';
import { objects, decorators } from 'util-kit';
import { defaultOptions } from '../config/default';
import Cropper from './cropper';
import ImageDocx from '../model/image-docx';
import IdocxJSONList from '../model/idocx-json-list';
import { fakeUrlToBase64, fakeBase64ToUrl, async } from '../util';

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
  loadingTxt: string = '请稍候...';

  // curent image docs
  imageDocx: ImageDocx | undefined;
  idocxUid: any;
  idocxList: IdocxJSONList | undefined;

  // util
  util = {
    urlToBase64: fakeUrlToBase64,
    base64ToUrl: fakeBase64ToUrl,
  };

  // 规范线
  sceneSpecificationOptions: any[] = [];
  scene: string = 'auto';

  constructor(cmp: any, config: any, util: any) {
    (window as any)._ctrl = this;

    const canvas = document.createElement('canvas');
    this.tmpFCanvas = new fabric.StaticCanvas(canvas, {});

    if (util) {
      const { urlToBase64, base64ToUrl } = util;
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
      this.cmp.forceUpdate();
    });

    this.fCanvas.on('object:modified', () => {
      this.cmp.forceUpdate();
    });

    this.cropper = new Cropper(this.fCanvas);
    this.viewMode = ViewMode.Normal;
    (window as any)._c = this.fCanvas;
  }

  registerContainer(container) {
    this.container = container;
  }

  @async('加载中...')
  async loadIdocx(data) {
    if (!data || this.idocxUid === data.uid || !this.idocxList || this.idocxList.empty()) {
      return;
    }
    // save current before load new if needed
    if (this.options.autoSave) {
      const currentIndex = this.idocxList.list.findIndex(item => item.uid === this.idocxUid);
      const currentRes = await this.saveIdocxToJSON();
      this.idocxList.list[currentIndex] = {
        ...this.idocxList.list[currentIndex],
        ...currentRes,
      };
      this.loading = true;
      this.loadingTxt = '加载中...';
      this.cmp.forceUpdate();
    }

    const prevMode = this.viewMode;
    const prevScene = this.scene;

    this.setViewMode(ViewMode.Normal);
    this.setCropperSpecification('auto');

    this.fCanvas.clear();
    this.imageDocx = new ImageDocx(data, this.util.urlToBase64, this.util.base64ToUrl);
    this.idocxUid = data.uid;
    await this.imageDocx.build();

    this.cropped = true;
    const { left, top, width, height, auto } = this.imageDocx.region;
    this.cropper.setSize({ left, top, width, height });
    this.cropper.auto = auto;

    for (let i = 0; i < this.imageDocx.layers.length; i++) {
      const docLayer = this.imageDocx.layers[i];
      await this.loadImage(docLayer, this.imageDocx.region);
    }
    this.setViewMode(prevMode);

    if (this.cropper.auto) {
      return this.setCropperSpecification(prevScene);
    }

    // find the nearset scene
    const curretRatio = width / height;
    const targetScene = this.sceneSpecificationOptions.find(
      item => Math.abs(item.ratioNum - curretRatio) <= PRECISION_SCENE_RATIO,
    );
    if (targetScene && targetScene.name) {
      this.setCropperSpecification(targetScene.name);
    } else {
      this.setCropperSpecification('auto');
    }
  }

  @async('加载中...')
  async addImage({ url, base64, name }) {
    const noIdocxList = !this.idocxList || this.idocxList.empty();
    const noIdocx = !this.imageDocx;
    if (!this.options.allowAddNewIdocx) {
      if (noIdocx || noIdocxList) {
        return;
      }
    }

    const newIdocx = {
      previewUrl: url || base64,
      layers: [
        {
          contentUrl: url,
          contentBase64: base64,
        },
      ],
    };

    if (noIdocxList) {
      this.idocxList = new IdocxJSONList([newIdocx]);
      await this.loadIdocx(this.idocxList.list[0]);
      return;
    }

    if (this.idocxList && noIdocx) {
      this.idocxList.add(newIdocx);
      const len = this.idocxList.list.length;
      await this.loadIdocx(this.idocxList.list[len - 1]);
      return;
    }

    if (!this.imageDocx) {
      return;
    }

    const prevMode = this.viewMode;
    this.setViewMode(ViewMode.Normal);

    const docLayer = await this.imageDocx.addImageLayer({ url, base64, name });
    await this.loadImage(docLayer, this.imageDocx.region);
    this.setViewMode(prevMode);
  }

  private loadImage(layer, region) {
    return new Promise((resolve, reject) => {
      const { contentBase64, uid, left, top, width, height, scaleX, scaleY, name, filter } = layer;
      fabric.Image.fromURL(contentBase64, oImg => {
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
          new fabric.Image.filters.Brightness({ brightness: filter.brightness }),
          new fabric.Image.filters.Contrast({ contrast: filter.contrast }),
          new fabric.Image.filters.HueRotation({ rotation: filter.hue }),
          new fabric.Image.filters.Saturation({ saturation: filter.saturation }),
        ];
        oImg.applyFilters();
        this.cropper.setSize({
          left: region.left,
          top: region.top,
          width: region.width,
          height: region.height,
        });
        this.fCanvas.add(oImg);
        if (this.cropped) {
          this.addCropzone();
        }
        this._fitSize();
        this.update();
        resolve(this);
      });
    });
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
  };

  setScale = scale => {
    if (typeof scale !== 'number') {
      return;
    }
    const pixelWidth = this.fCanvas.getWidth();
    const pixelHeight = this.fCanvas.getHeight();
    this.scale = scale;
    this.fCanvas._setCssDimension('width', `${pixelWidth * this.scale}px`);
    this.fCanvas._setCssDimension('height', `${pixelHeight * this.scale}px`);
  };

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

  setCropperSpecification(name: string, inital = false) {
    if (this.scene === name) {
      return;
    }
    this.scene = name;
    const opt = this.sceneSpecificationOptions.find(opt => opt.name === name);
    if (!opt) {
      // remove image element from cropper and unlock uniscale
      this.cropper.removeCropperBgImage();
      return;
    }
    const { ratioNum, base64 } = opt;
    let { left, top, width, height } = this.cropper;
    const canvasWidth = this.fCanvas.getWidth();
    const canvasHeight = this.fCanvas.getHeight();
    if (this.cropper.auto) {
      const canvasRatio = canvasWidth / canvasHeight;
      if (canvasRatio > ratioNum) {
        height = canvasHeight;
        width = Math.ceil(canvasHeight * ratioNum);
      } else {
        width = canvasWidth;
        height = Math.ceil(canvasWidth / ratioNum);
      }
      left = Math.ceil((canvasWidth - width) / 2);
      top = Math.ceil((canvasHeight - height) / 2);
    } else {
      width = Math.ceil(height * ratioNum);
    }

    this.cropper.addCropperBgImage(base64, { left, top, width, height });
    this.update();
  }

  setViewMode(mode) {
    const prevMode = this.viewMode;
    if (prevMode === mode) {
      return;
    }
    this.viewMode = mode;
    this.fCanvas.discardActiveObject();
    this.fCanvas.renderAll();
    if (mode === ViewMode.Crop) {
      this.cropper.activeCropView();
    } else {
      this.cropper.activeNormalView();
    }
    this.update();
  }

  getSize() {
    if (!this.imageDocx) {
      return [0, 0];
    }
    const width = this.fCanvas.getWidth();
    const height = this.fCanvas.getHeight();
    return [width, height];
  }

  changeDimension(type, val) {
    this.fCanvas.setDimensions({ [type]: val });
    this.setScale(this.scale);
    this.update();
  }

  update = () => {
    this.fCanvas.renderAll();
    setTimeout(() => {
      this.cmp.forceUpdate();
    });
  };

  getCropperParam() {
    if (!this.imageDocx) {
      return { left: 0, top: 0, width: 0, height: 0 };
    }
    return this.cropper.getCropperParam();
  }

  setCropperParam(type, val) {
    if (!this.imageDocx) {
      return;
    }
    this.cropper.setSize({ [type]: val });
    this.update();
  }

  @async('合成中...')
  exportImage(): Promise<any> {
    const canvasWidth = this.fCanvas.getWidth();
    const canvasHeight = this.fCanvas.getHeight();

    this.tmpFCanvas.clear();
    this.tmpFCanvas.setDimensions({ width: canvasWidth, height: canvasHeight });
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
          this.tmpFCanvas.forEachObject(obj => {
            const originLeft = obj.left;
            const originTop = obj.top;
            obj.set({
              left: originLeft - left,
              top: originTop - top,
            });
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
            const base64 = this.tmpFCanvas.toDataURL({
              format: this.options.outputFormat || 'png',
              quality: this.options.outputQuality || 1,
            });
            resolve({
              base64,
              width,
              height,
            });
          }, 0);
        });
      });
    });
  }

  syncIdocx() {
    let changed = false;
    if (!this.imageDocx) {
      return changed;
    }
    const layers = this.getAllLayers();
    if (this.imageDocx.syncCanvasObjects(layers)) {
      changed = true;
    }
    if (this.imageDocx.syncRegion(this.cropper)) {
      changed = true;
    }
    return changed;
  }

  @async()
  async saveIdocxToJSON() {
    if (!this.imageDocx) {
      return undefined;
    }
    const changed = this.syncIdocx();
    let img: any = null;
    console.log('changed', changed);
    if (changed) {
      img = await this.exportImage();
    }
    const obj: any = this.imageDocx.toJSON();
    if (img) {
      obj.previewBase64 = img.base64;
      obj.previewWidth = img.width;
      obj.previewHeight = img.height;
    }
    return obj;
  }

  @async('保存中...')
  async saveCurrentIdocx() {
    const { idocxUid, imageDocx } = this;
    if (!this.idocxList) {
      return;
    }
    const currentIndex = this.idocxList.list.findIndex(item => item.uid === idocxUid);
    if (!idocxUid || !imageDocx || currentIndex === -1) {
      return;
    }
    const data = await this.saveIdocxToJSON();

    this.idocxList.list[currentIndex] = {
      ...this.idocxList.list[currentIndex],
      ...data,
    };
    this.cmp.forceUpdate();
    return objects.deepClone(this.idocxList.list[currentIndex]);
  }

  async deleteIdox(data) {
    if (!data || !this.idocxList || this.idocxList.empty()) {
      return;
    }
    const targetIndex = this.idocxList.list.findIndex(item => item.uid === data.uid);

    if (this.idocxUid !== data.uid) {
      this.idocxList.list.splice(targetIndex, 1);
      this.update();
      return;
    }

    // const prevMode = this.viewMode;
    this.setViewMode(ViewMode.Normal);

    this.fCanvas.clear();
    this.imageDocx = undefined;
    this.idocxList.list.splice(targetIndex, 1);
    this.update();

    // save current before load new
  }

  @async()
  async outputIdocxList() {
    if (!this.idocxList || this.idocxList.empty()) {
      return [];
    }
    if (this.options.autoSave && this.imageDocx) {
      await this.saveCurrentIdocx();
      this.loading = true;
      this.cmp.forceUpdate();
    }
    const output = objects.deepClone(this.idocxList.list) || [];
    for (let i = 0; i < output.length; i++) {
      const item: any = output[i];
      const { previewBase64, layers } = item;
      if (previewBase64) {
        item.previewUrl = await this.util.base64ToUrl(previewBase64);
        delete item.previewBase64;
      }
      delete item.uid;
      console.log(item);
      // remove all base64 in layers
      layers.forEach(layer => delete layer.contentBase64);
    }
    return output;
  }
}
