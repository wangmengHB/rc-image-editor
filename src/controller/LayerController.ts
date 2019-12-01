import { fabric } from 'fabric';
import { CANVAS_MAX_WIDTH, CANVAS_MAX_HEIGHT, CanvasEditMode } from '../const';


export default class LayerController {

  fCanvas: any;

  imgObjList: any[] = [];

  cmp: any;

  editMode: CanvasEditMode;

  constructor(cmp: any) {
    this.cmp = cmp;
  }

  init(canvas) {
    this.fCanvas = canvas;
    this.fCanvas.on('selected', () => {
      console.log('canvas selected');
      this.cmp.forceUpdate();
    });
    this.editMode = CanvasEditMode.Pan;
    this.cmp.forceUpdate();
  }


  addImage(imageEle, filename, width, height) {

    this.fCanvas.width;
    this.fCanvas.height;

    const oImg = new fabric.Image(imageEle, { name: filename});

    
    const brightnessFilter = new fabric.Image.filters.Brightness({brightness: 0});
    const contrastFilter = new fabric.Image.filters.Contrast({contrast: 0});
    const hueFilter = new fabric.Image.filters.HueRotation({rotation: 0});
    const saturationFilter = new fabric.Image.filters.Saturation({saturation: 0});

    oImg.filters.push(
      brightnessFilter,
      contrastFilter,
      hueFilter,
      saturationFilter,
    );
    
    oImg.applyFilters();

    (window as any)._f1 = brightnessFilter;

    this.imgObjList.push(oImg);
    oImg.on('selected', () => {
      console.log('image selected');
      this.cmp.forceUpdate();
    })


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

  getActiveObject() {
    if (!this.fCanvas) {
      return;
    }
    return this.fCanvas.getActiveObject();
  }

  setActiveObject(item) {
    if (!this.fCanvas) {
      return;
    }
    this.fCanvas.setActiveObject(item)
  }


  setEditMode(mode) {

    this.editMode = mode;
    // todo: sth
    this.cmp.forceUpdate();
  }

  update() {
    if (!this.fCanvas) {
      return;
    }
    this.fCanvas.renderAll();
    this.cmp.forceUpdate();
  }





}

