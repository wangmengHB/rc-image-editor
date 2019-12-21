import { IdocxJSON } from '../interface';
import { numbers, arrays, generateUuid, asyncs, objects, decorators } from 'util-kit';

export default class IdocxJSONList {
  list: IdocxJSON[] = [];

  constructor(list: any[]) {
    this.list = list.map(item => {
      const uid = item.uid || generateUuid();
      return { ...item, uid };
    });
  }

  add(item) {
    this.list.push({
      ...item,
      uid: generateUuid(),
    });
  }

  empty() {
    return this.list.length === 0;
  }
}
