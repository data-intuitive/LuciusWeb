import { Settings } from '../models/settings';
import { Compound } from '../models/compound';

export class Parser {

  static parseURL(settings: Settings, classPath: string) {
    return settings.serverURL + '?' + settings.queryStr + '&classPath=luciusapi.' + classPath;
  }

  static parseClassPath(url: string): string {
    let queryString = url.substring(url.indexOf('?') + 1 );
    let start = queryString.indexOf('.') + 1;
    let end = queryString.length;
    return queryString.substring(start, end);
  }

  static parseRelatedCompounds(relatedCompounds: Compound): Array<string> {
    let relatedCompoundsArray = [];
    for (let entry of relatedCompounds.result) {
      relatedCompoundsArray.push(entry[0].toString());
    }
    return relatedCompoundsArray;
  }

  static parseSimiliarityValues(zhangArray: Array<Array<string>>): Array<number> {
    let zhangValues = [];
    for (let entry of zhangArray) {
      zhangValues.push(entry[1]);
    }
    return zhangValues;
  }

  static parsePwids(zhangArray: Array<Array<string>>): Array<string> {
    let pwids = [];
    for (let entry of zhangArray) {
      pwids.push(entry[3]);
    }
    return pwids;
  }
}
