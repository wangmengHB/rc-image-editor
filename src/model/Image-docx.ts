import Layer from './Layer';
import Region from './Region';


export default class ImageDocx {

  previewUrl: string;

  layers: Layer[] = [];
  region: Region;

  _intialized: boolean = false;

  constructor(json, private urlToBase64: Function, private base64ToUrl: Function) {
    const { layers, region, previewUrl } = json;
    if (!Array.isArray(layers)) {
      throw new Error('layers must be an array!');
    }
    this.layers = layers.map(item => new Layer(item, this.urlToBase64, this.base64ToUrl));
    this.region = new Region(region);
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
    }, this.urlToBase64, this.base64ToUrl);
    await layer.build(); 
    this.layers.push(layer);
    this.region.checkSize(
      Math.max(...this.layers.map(item => item.width)), 
      Math.max(...this.layers.map(item => item.height))
    );
    return layer;
  }

  syncCanvasObjects(layers: any[]) {
    const _layers: any[] = [];
    layers.forEach(canvasObject => {
      const {
        uid, left, top, width, height, 
        scaleX, scaleY, filters
      } = canvasObject;
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

      target.syncFilter(filters);

      let pixelUnChanged = filters.every((item) => {
        const keys = Object.keys(item);
        return keys.every(key => {
          if (typeof item[key] === 'number') {
            return item[key] === 0;
          }
          return true;
        })
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
  }


  async toJSON() {
    const layers: any[] = [];
    for (let i = 0; i < this.layers.length; i++) {
      const item = this.layers[i];
      
      const base64 = item.contentUrl || item.contentBase64;

      const url = await this.base64ToUrl(base64);

      layers.push({
        x: item.left,
        y: item.top,
        vWidth: item.vWidth,
        vHeight: item.vHeight,
        filter: item.filter,
        contentUrl: url
      });
    }
    
    const region = {
      x: this.region.left,
      y: this.region.top,
      vWidth: this.region.width,
      vHeight: this.region.height,
    };

    return {
      layers,
      region
    };

  }

}





