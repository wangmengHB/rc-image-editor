import { numbers, arrays, generateUuid, asyncs, objects } from 'util-kit';
import { getImageSize } from '../util';

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
  };

  // uid
  uid: string;
  name: string;

  // target data
  targetUrl: string | undefined;
  targetBase64: string | undefined;

  constructor(json: any = {}, private urlToBase64: Function, private base64ToUrl: Function) {
    const { contentUrl, contentBase64, x, y, vWidth, vHeight, name, filter } = json;
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
      this.syncFilter(filter);
    }
  }

  async build() {
    // todo: for cross-orgin safety issue, you must do sth get base64 content
    // otherwise canvas can not read pixel data from cross-origin image

    // local images
    if (!this.contentUrl && this.contentBase64) {
      this.contentUrl = await this.base64ToUrl(this.contentBase64);
    }

    if (!this.contentBase64) {
      this.contentBase64 = await this.urlToBase64(this.contentUrl);
    }

    if (this.width <= 0 || this.height <= 0) {
      const { width, height } = await getImageSize(this.contentBase64);
      this.width = width;
      this.height = height;
    }

    if (this.vWidth <= 0 || this.vHeight <= 0) {
      this.vWidth = this.width;
      this.vHeight = this.height;
      this.scaleX = 1;
      this.scaleY = 1;
    } else {
      // not allowed uniscale
      this.scaleX = this.vWidth / this.width;
      this.scaleY = this.scaleX;
      this.vHeight = Math.ceil(this.height * this.scaleY);
    }
  }

  syncFilter(filter = {}) {
    let changed = false;
    let res: any = {};
    if (Array.isArray(filter)) {
      filter.forEach(item => {
        const iKeys = Object.keys(item);
        iKeys.forEach(key => {
          res[key] = item[key];
        });
      });
    } else {
      res = { ...filter };
    }
    const keys = Object.keys(res);
    keys.forEach(key => {
      if (typeof res[key] === 'number') {
        let alias = key;
        if (key === 'rotation') {
          alias = 'hue';
        }
        if (this.filter[alias] !== res[key]) {
          this.filter[alias] = clamp(res[key], -1, 1);
          changed = true;
        }
      }
    });

    return changed;
  }
}
