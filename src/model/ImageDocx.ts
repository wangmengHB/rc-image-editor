/*
  idocx means: image document for persisent storage

*/
import Layer from './Layer';
import Cropzone from './Cropzone';



export default class ImageDocx {

  layers: Layer[] = [];
  region: Cropzone | null;

  _intialized: boolean = false;

  constructor(json) {
    const { layers, region } = json;
    if (!Array.isArray(layers)) {
      throw new Error('layers must be an array!');
    }
    this.layers = layers.map(item => new Layer(item));
    if (region) {
      this.region = new Cropzone(region);
    } else {
      this.region = null;
    }   
    
    this._intialized = false;
  }

  async build() {
    
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      await layer.build();
    }
    if (this.region) {
      this.region.checkSize(
        Math.max(...this.layers.map(item => item.width)), 
        Math.max(...this.layers.map(item => item.height))
      );
    }
  }

  syncLayers(layers: any[]) {
    const _layers = [];

    layers.forEach(cLayer => {
      const {uid, left, top, width, height, scaleX, scaleY, filters} = cLayer;
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
        target.targetBase64 = cLayer.toDataURL();
      }
      _layers.push(target);
    });
    this.layers = _layers;
  }

  syncRegion(cropper: any) {

  }


  toJSON() {
    
    const region = null;

    const layers = this.layers.map(item => {
      const url = item.targetBase64 || item.contentBase64;

      // todo fetch url from base64

      return {
        x: item.left,
        y: item.top,
        vWidth: item.vWidth,
        vHeight: item.vHeight,
        contentUrl: url
      };
    })

    return {
      layers,
      region
    };

  }





}


