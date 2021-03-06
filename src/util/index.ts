import { objects, decorators } from 'util-kit';

export function fakeBase64ToUrl(base64) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const url = base64;
      resolve(url);
    }, 0);
  })
}


export function fakeUrlToBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image(); 
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      resolve(canvas.toDataURL());
    }
    img.src = url;
  });
}


export function getImageSize(base64): Promise<any> {
  return new Promise((resolve, reject) => {
    const img = new Image(); 
    img.onload = () => {
      const data = {
        width: img.width,
        height: img.height,
      };
      img.onload = null;
      resolve(data);
    }
    img.src = base64;
  });
}

export function async(txt: string = '处理中...') {
  return decorators.createDecorator((fn, key) => {
		return function (this: any, ...args: any[]) {
      
      const p = fn.apply(this, args);

      if (p && typeof p.then === 'function') {
        this.loading = true;
        this.loadingTxt = txt;
        this.cmp.forceUpdate();
        Promise.resolve(p).finally(() => {
          this.loading = false;
          this.update();
        });
      }
      return p;

		};
	});
}

