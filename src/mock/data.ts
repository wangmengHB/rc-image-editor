
import MAIN_IMAGE_URL_1 from '../../assets/main.jpeg';
import MAIN_IMAGE_URL_2 from '../../assets/main2.png';
import MAIN_IMAGE_URL_4 from '../../assets/main4.jpg';
import TEST_LOGO_URL_1 from '../../assets/_logo3.png';


const IDOCX_1 = {
  previewUrl: MAIN_IMAGE_URL_1,
  layers: [
    {
      contentUrl: MAIN_IMAGE_URL_1,
      x: 0,
      y: 0,
      vWidth: 0,
      vHeight: 0,
      name: '',
    },
    {
      contentUrl: TEST_LOGO_URL_1,
      x: 300,
      y: 200,
      vWidth: 600,
      vHeight: 200,
      name: '',
    },
  ],
  region: {
    x: 100,
    y: 100,
    vHeight: 800,
    vWidth: 800,
  }
};


const IDOCX_2 = {
  previewUrl: MAIN_IMAGE_URL_2,
  layers: [
    {
      contentUrl: MAIN_IMAGE_URL_2,
      x: 0,
      y: 0,
      vWidth: 0,
      vHeight: 0,
      name: '',
    },
    {
      contentUrl: TEST_LOGO_URL_1,
      x: 300,
      y: 200,
      vWidth: 600,
      vHeight: 200,
      name: '',
    },
  ],
  region: {
    x: 300,
    y: 200,
    vHeight: 400,
    vWidth: 400,
  }
};

const IDOCX_4 = {
  previewUrl: MAIN_IMAGE_URL_4,
  layers: [
    {
      contentUrl: MAIN_IMAGE_URL_4,
      x: 0,
      y: 0,
      vWidth: 0,
      vHeight: 0,
      name: '',
    },
    {
      contentUrl: TEST_LOGO_URL_1,
      x: 300,
      y: 200,
      vWidth: 600,
      vHeight: 200,
      name: '',
    },
  ],
  region: {
    x: 0,
    y: 0,
    vHeight: 0,
    vWidth: 0,
  }
};

export const IMAGE_DOCX_LIST = [IDOCX_4, IDOCX_1, IDOCX_2];







