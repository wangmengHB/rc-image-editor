import { numbers, arrays, generateUuid, asyncs, objects } from 'util-kit';

const { clamp } = numbers;


export default class Layer {

  // origin data
  contentUrl: string;
  contentBase64: string;

  // pixel size
  width: number = 0;
  height: number = 0;

  left: number = 0;
  top: number = 0;

  // view size
  vWidth: number = 0;
  vHeight: number = 0;

  scaleX: number = 1;
  scaleY: number = 1;

  // filter
  filter = {
    brightness: 0,
    contrast: 0,
    hue: 0,
    saturation: 0,
  }

  // uid
  uid: string;
  name: string;

  // target data
  targetUrl: string;
  targetBase64: string;

  constructor(json: any = {}) {
    const { contentUrl, contentBase64, x, y, vWidth, vHeight, name, filter} = json;
    if (!contentUrl && !contentBase64) {
      throw new Error('layer has no image source!');
    }
    this.left = x || 0;
    this.top = y || 0;
    this.contentUrl = contentUrl;
    this.contentBase64 = contentBase64;
    this.vWidth = vWidth || 0;
    this.vHeight = vHeight || 0;
    this.uid = generateUuid();
    this.name = name || '';
    if (filter) {
      this.initialFilter(filter);
    }
  }



  async build() {
    // todo: for cross-orgin safety issue, you must do sth get base64 content
    // otherwise canvas can not read pixel data from cross-origin image
    
    if (!this.contentBase64) {
      this.contentBase64 = await fakeUrlToBase64(this.contentUrl);
    }
    if (this.width <= 0 || this.height <= 0) {
      const {width, height} = await getImageSize(this.contentBase64);
      this.width = width;
      this.height = height;
    }

    if (this.vWidth <= 0 || this.vHeight <= 0) {
      this.vWidth = this.width;
      this.vHeight = this.height;
      this.scaleX = 1;
      this.scaleY = 1;
    } else {
      this.scaleX = this.vWidth / this.width;
      // this.scaleY = this.vHeight / this.height;
      // not allowed uniscale
      this.scaleY = this.scaleX;
    }

  }

  initialFilter(filter = {}) {
    const keys = Object.keys(filter);
    keys.forEach(key => {
      if (typeof filter[key] === 'number') {
        this.filter[key] = clamp(filter[key], -1, 1);
      }
    })
  }
  
}


function fakeUrlToBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image(); 
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, img.width, img.height);
      resolve(canvas.toDataURL());
    }
    img.src = url;
  });
}


function getImageSize(base64): Promise<any> {
  return new Promise((resolve, reject) => {
    const img = new Image(); 
    img.onload = () => {
      // const canvas = document.createElement('canvas');
      // canvas.width = img.width;
      // canvas.height = img.height;
      // const ctx = canvas.getContext('2d');
      // ctx.drawImage(img, 0, 0, img.width, img.height);
      
      const data = {
        width: img.width,
        height: img.height,
      }
      resolve(data);
    }
    img.src = base64;
  });
}

