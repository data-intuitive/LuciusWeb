import { Settings, Compound } from '../models/';

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
    let i;
    for (i = 0; i < relatedCompounds.result.length ; i++) {
      relatedCompoundsArray.push(relatedCompounds.result[i][0].toString());
    }
    return relatedCompoundsArray;
  }

  static parseSimiliarityValues(zhangArray: Array<Array<string>>): Array<number> {
    let zhangValues = [];
    let i;
    for (i = 0; i < zhangArray.length; i++) {
      zhangValues[i] = (+zhangArray[i][1]);
    }
    return zhangValues;
  }

  static parsePwids(zhangArray: Array<Array<string>>): Array<string> {
    let pwids = [];
    let i;
    for (i = 0; i < zhangArray.length ; i++) {
      pwids[i] = zhangArray[i][3];
    }
    return pwids;
  }
}
