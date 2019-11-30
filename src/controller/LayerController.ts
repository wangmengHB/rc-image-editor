import { fabric } from 'fabric';

export default class LayerController {

  fCanvas: any;

  constructor() {

  }

  init(canvas) {
    this.fCanvas = canvas;
  }


  addImage(imageEle, filename, width, height) {

    this.fCanvas.width;
    this.fCanvas.height;

    const oImg = new fabric.Image(imageEle);

    this.fCanvas.setWidth(width);
    this.fCanvas.setHeight(height);

    this.fCanvas.set({
      width, height
    })


    this.fCanvas.add(oImg);

    (window as any)._c = this.fCanvas;



  }





}