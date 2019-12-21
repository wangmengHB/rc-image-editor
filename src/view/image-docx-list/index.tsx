import * as React from 'react';
import { Button, Modal, Slider, Icon, Divider, Checkbox, message } from 'antd';
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
}


export default class ImageDocxList extends React.Component<ImageDocxListProps>{

  loadIdocx = item => {
    const { layerController } = this.props;
    layerController.loadIdocx(item);
  };

  deleteIdocx = item => {
    const { layerController } = this.props;
    layerController.deleteIdox(item);
  };

  render() {
    const { layerController, className, style } = this.props;
    const { idocxList } = layerController;
    console.log(idocxList);

    let list = [];
    if (idocxList && Array.isArray(idocxList.list)) {
      list = idocxList.list;
    }
    
    return (
      <div className={classnames([styles['doc-list-panel'], className])} style={style}>
        <div className={styles['title']}>文件列表</div>
        <div className={styles['doc-list']}>
          {list.map((item: any) => {
            const isActive = layerController.idocxUid === item.uid;
            const { previewUrl, previewBase64, label } = item;
            const url = previewBase64 || previewUrl;

            return (
              <div
                className={classnames({ [styles['item']]: true, [styles['active']]: isActive })}
                key={item.uid}
              >
                <img
                  onClick={() => this.loadIdocx(item)}
                  className={styles['thunbnail']}
                  src={url}
                />
                {label ? <div className={styles.label}>{label}</div> : null}
                <a className={styles.close} onClick={() => this.deleteIdocx(item)}>
                  <Icon type="close" />
                </a>
              </div>
            );
          })}
        </div>
        


      </div>
    )
  }

}