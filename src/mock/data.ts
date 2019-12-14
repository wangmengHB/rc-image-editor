
import TEST_IMAGE_URL_1 from '../../assets/main.jpeg';
import TEST_LOGO_URL_1 from '../../assets/_logo3.png';


const DATA_1 = {
  layers: [
    {
      contentUrl: TEST_IMAGE_URL_1,
      x: 0,
      y: 0,
      vWidth: 1366,
      vHeight: 768,
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
    x: 200,
    y: 300,
    vHeight: 400,
    vWidth: 400,
  }
};


(window as any).mock1 = DATA_1;









