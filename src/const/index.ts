
export const CANVAS_MAX_WIDTH = 1000;
export const CANVAS_MAX_HEIGHT = 500;

export const CANVAS_INIT_WIDTH = 400;
export const CANVAS_INIT_HEIGHT = 400;

export const CANVAS_PADDING = 20;


export const MIN_SCALE = 0.0001;

export const MAX_CANVAS_PIXEL_SIZE = 40000;
export const MIN_CANVAS_PIXEL_SIZE = 20;

export const MAX_POS_VAL = 40000;
export const MIN_POS_VAL = -MAX_POS_VAL;


export const CROP_STYLE = Object.freeze({
  borderColor: "#fff",
  cornerColor: "#fff",
  cornerSize: 16,
  cornerStrokeColor: "#fff",
  cornerStyle: "circle",
  lineWidth: 2,
  transparentCorners: false
})



export enum Direction {
  Up = 'up',
  Down = 'down',
}

export enum CanvasEditMode {
  Pan = 'pan',
  Filter = 'filter',
  Crop = 'crop',
  Pencil = 'pencil',
}

export const KEY_CODES = {
  Z: 90,
  Y: 89,
  SHIFT: 16,
  BACKSPACE: 8,
  DEL: 46
};


export enum COMPONENT_NAMES {
  CROPPER = 'CROPPER',
  FLIP = 'FLIP',
  ROTATION = 'ROTATION',
  // 'FREE_DRAWING',
  // 'LINE',
  // 'TEXT',
  // 'ICON',
  // 'FILTER',
  // 'SHAPE'
}
  








