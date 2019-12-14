import { numbers, arrays, generateUuid, asyncs, objects } from 'util-kit';


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

  scale: number = 1;

  // uid
  uid: string;

  // target data
  targetUrl: string;
  targetBase64: string;

  constructor(json: any = {}) {
    const { contentUrl, contentBase64, x, y, vWidth, vHeight} = json;
    if (!contentUrl && !contentBase64) {
      throw new Error('layer has no image source!');
    }
    this.left = x;
    this.top = y;
    this.contentUrl = contentUrl;
    this.contentBase64 = contentBase64;
    this.vWidth = vWidth;
    this.vHeight = vHeight;
    this.uid = generateUuid();
  }



  async build() {
    // todo: for cross-orgin safety issue, you must do sth get base64 content
    // otherwise canvas can not read pixel data from cross-origin image
    if (!this.contentBase64 || this.width <= 0 || this.height <= 0) {
      const {base64, width, height} = await fakeConvertBase64(this.contentUrl);
      this.width = width;
      this.height = height;
      this.contentBase64 = base64;
    }
  }

  async toJSON(removeBase64: boolean = true) {

  }

  


}


function fakeConvertBase64(url): Promise<any> {
  return new Promise((resolve, reject) => {
    const img = new Image(); 
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, img.width, img.height);
      
      const data = {
        width: img.width,
        height: img.height,
        base64: canvas.toDataURL(),
      }
      resolve(data);
    }
    img.src = url;
  });
}
