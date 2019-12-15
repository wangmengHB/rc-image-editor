/*
  idocx means: image document for persisent storage

*/
import Layer from './Layer';
import Cropzone from './Cropzone';



export default class ImageDocx {

  previewUrl: string;

  layers: Layer[] = [];
  region: Cropzone | null;

  _intialized: boolean = false;

  constructor(json) {
    const { layers, region, previewUrl } = json;
    if (!Array.isArray(layers)) {
      throw new Error('layers must be an array!');
    }
    this.layers = layers.map(item => new Layer(item));
    this.region = new Cropzone(region);
    this.previewUrl = previewUrl;
    this._intialized = false;
  }

  async build() {
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      await layer.build();
    }
    this.region.checkSize(
      Math.max(...this.layers.map(item => item.width)), 
      Math.max(...this.layers.map(item => item.height))
    );
  }

  async addImageLayer({url, base64, name}) {
    const layer = new Layer({
      contentUrl: url,
      contentBase64: base64,
      name
    });
    await layer.build(); 
    this.layers.push(layer);
    this.region.checkSize(
      Math.max(...this.layers.map(item => item.width)), 
      Math.max(...this.layers.map(item => item.height))
    );
    return layer;
  }

  syncCanvasObjects(layers: any[]) {
    const _layers = [];
    layers.forEach(canvasObject => {
      const {uid, left, top, width, height, scaleX, scaleY, filters} = canvasObject;
      const target = this.layers.find(item => item.uid === uid);
      if (!target) {
        return;
      }
      target.left = left;
      target.top = top;
      target.width = width;
      target.height = height;
      target.vWidth = width * scaleX;
      target.vHeight = height * scaleY;
      let pixelUnChanged = filters.every((item) => {
        const keys = Object.keys(item);
        return keys.every(key => item[key] === 0)
      });
      if (!pixelUnChanged) {
        target.targetBase64 = canvasObject.toDataURL();
      }
      _layers.push(target);
    });
    this.layers = _layers;
  }

  syncRegion(cropper: any) {
    const { left, top, width, height} = cropper;
    this.region.left = left;
    this.region.top = top;
    this.region.width = width;
    this.region.height = height;
    this.region.vWidth = width;
    this.region.vHeight = height;
  }


  async toJSON() {
    const layers = [];
    for (let i = 0; i < this.layers.length; i++) {
      const item = this.layers[i];
      const base64 = item.targetBase64 || item.contentBase64;

      // todo fetch url from base64
      const url = await fakeBase64ToUrl(base64);

      layers.push({
        x: item.left,
        y: item.top,
        vWidth: item.vWidth,
        vHeight: item.vHeight,
        contentUrl: url
      });
    }
    
    const region = {
      x: this.region.left,
      y: this.region.top,
      vWidth: this.region.vWidth,
      vHeight: this.region.vHeight,
    };

    return {
      layers,
      region
    };

  }

}


function fakeBase64ToUrl(base64) {
  return new Promise((resolve, reject) => {

    setTimeout(() => {
      const url = base64;
      resolve(url);
    }, 100)

  })

}


