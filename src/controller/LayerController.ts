import { fabric } from 'fabric';
import { CANVAS_MAX_WIDTH, CANVAS_MAX_HEIGHT } from '../const';


export default class LayerController {

  fCanvas: any;

  imgObjList: any[] = [];

  cmp: any;

  constructor(cmp: any) {
    this.cmp = cmp;
  }

  init(canvas) {
    this.fCanvas = canvas;
  }


  addImage(imageEle, filename, width, height) {

    this.fCanvas.width;
    this.fCanvas.height;

    const oImg = new fabric.Image(imageEle, { name: filename});
    this.imgObjList.push(oImg);

    const max_width = Math.max(...this.imgObjList.map((item: any) => item.width));
    const max_height = Math.max(...this.imgObjList.map((item: any) => item.height));

    this.fCanvas.setWidth(max_width);
    this.fCanvas.setHeight(max_height);

    this.fCanvas.add(oImg);
    (this.cmp).forceUpdate();

    

    (window as any)._o = oImg;

  }


  getAllLayers() {
    if (!this.fCanvas) {
      return [];
    }

    return this.fCanvas.getObjects();
  }

  delete(item) {
    if (!this.fCanvas) {
      return;
    }
    this.fCanvas.remove(item);

  }





}