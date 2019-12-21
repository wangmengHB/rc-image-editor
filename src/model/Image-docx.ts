import Layer from './Layer';
import Region from './Region';

export default class ImageDocx {
  previewUrl: string;
  previewBase64: string;
  previewWidth: number = 0;
  previewHeight: number = 0;

  layers: Layer[] = [];
  region: Region;

  autoRegion: boolean = false;
  _intialized: boolean = false;

  constructor(json, private urlToBase64: Function, private base64ToUrl: Function) {
    const { layers, region, previewUrl, previewBase64, previewWidth, previewHeight } = json;
    if (!Array.isArray(layers)) {
      throw new Error('layers must be an array!');
    }
    this.layers = layers.map(item => new Layer(item, this.urlToBase64, this.base64ToUrl));
    this.region = new Region(region);
    this.previewUrl = previewUrl;
    this.previewBase64 = previewBase64 || '';
    this.previewWidth = previewWidth || 0;
    this.previewHeight = previewHeight || 0;

    this._intialized = false;
  }

  async build() {
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      await layer.build();
    }
    this.region.checkSize(
      Math.max(...this.layers.map(item => item.width)),
      Math.max(...this.layers.map(item => item.height)),
    );
    if (this.region.auto) {
      this.autoRegion = true;
    }
  }

  async addImageLayer({ url, base64, name }) {
    const layer = new Layer(
      {
        contentUrl: url,
        contentBase64: base64,
        name,
      },
      this.urlToBase64,
      this.base64ToUrl,
    );
    await layer.build();
    this.layers.push(layer);
    this.region.checkSize(
      Math.max(...this.layers.map(item => item.width)),
      Math.max(...this.layers.map(item => item.height)),
    );
    return layer;
  }

  syncCanvasObjects(layers: any[]) {
    let changed = false;
    const prevLayers = this.layers.slice();
    if (layers.length !== prevLayers.length) {
      changed = true;
    }
    const _layers: any[] = [];
    layers.forEach((canvasObject, index: number) => {
      const { uid, left, top, width, height, scaleX, scaleY, filters } = canvasObject;
      const vWidth = Math.ceil(width * scaleX);
      const vHeight = Math.ceil(height * scaleY);
      const target = prevLayers.find(item => item.uid === uid);
      if (!target) {
        changed = true;
        return;
      }
      ['left', 'top', 'width', 'height'].forEach(key => {
        if (target[key] !== canvasObject[key]) {
          target[key] = canvasObject[key];
          changed = true;
          console.log('changed 1');
        }
      });

      if (target.vWidth !== vWidth) {
        changed = true;
        console.log('changed 2');
        target.vWidth = vWidth;
      }

      if (target.vHeight !== vHeight) {
        changed = true;
        console.log('changed 3');
        console.log(target.vHeight, vHeight);
        target.vHeight = vHeight;
      }

      if (target.syncFilter(filters)) {
        changed = true;
        console.log('changed 4');
      }
      _layers.push(target);
    });
    this.layers = _layers;

    return changed;
  }

  syncRegion(cropper: any) {
    let changed = false;
    ['left', 'top', 'width', 'height'].forEach(key => {
      if (this.region[key] !== cropper[key]) {
        changed = true;
        this.region[key] = cropper[key];
        console.log('changed 5');
      }
    });
    return changed;
  }

  toJSON() {
    const { previewUrl, previewBase64, previewWidth, previewHeight } = this;
    const layers: any[] = [];
    for (let i = 0; i < this.layers.length; i++) {
      const item = this.layers[i];
      layers.push({
        x: item.left,
        y: item.top,
        vWidth: item.vWidth,
        vHeight: item.vHeight,
        filter: item.filter,
        contentUrl: item.contentUrl,
        contentBase64: item.contentBase64,
      });
    }

    const region = {
      x: this.region.left,
      y: this.region.top,
      vWidth: this.region.width,
      vHeight: this.region.height,
      auto: this.region.auto,
    };
    
    return {
      layers,
      region,
      previewUrl,
      previewBase64,
      previewWidth,
      previewHeight,
    };
  }
}
