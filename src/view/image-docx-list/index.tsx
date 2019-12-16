import * as React from 'react';
import { Button, Modal, Slider, InputNumber, Divider, Checkbox, message } from 'antd';
import { 
  MAX_CANVAS_PIXEL_SIZE, MAX_POS_VAL, MIN_POS_VAL,
  MIN_CANVAS_PIXEL_SIZE, 
  ViewMode,
} from '../../const';
import styles from './index.module.less';
import classnames from 'classnames';
import IdocxJSONList from '../../model/idocx-json-list';



export interface ImageDocxListProps{
  className?: string;
  style?: React.CSSProperties;
  layerController: any;
  idocxList: IdocxJSONList;
}


export default class ImageDocxList extends React.Component<ImageDocxListProps>{

  loadIdocx = (item) => {
    const { layerController, idocxList } = this.props;
    const uid = layerController.idocxUid;
    if ( uid === item.uid) {
      return;
    }
    const currentIndex = idocxList.list.findIndex(item => item.uid === uid);
    layerController.toJSON().then(data => {
      idocxList.list[currentIndex] = {
        ...idocxList.list[currentIndex],
        ...data
      }
      layerController.loadIdocx(item);
    });
    
  }

  render() {
    const { layerController, className, style, idocxList } = this.props;
    
    return (
      <div className={classnames([styles['doc-list-panel'], className])} style={style}>
        <div className={styles['title']}>文件列表</div>
        <div className={styles['doc-list']}>
          {
            idocxList.list.map(item => {
              const isActive = layerController.idocxUid === item.uid;

              return (
                <div 
                  className={classnames({[styles['item']]: true, [styles['active']]: isActive})}
                  onClick={() => this.loadIdocx(item)}
                  key={item.uid}
                >
                  <img className={styles['thunbnail']} src={item.previewUrl}/>
                </div>
              )
            })
          }
        </div>


      </div>
    )
  }

}