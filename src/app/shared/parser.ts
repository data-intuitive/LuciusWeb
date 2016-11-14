import { Settings, CompoundEnum, Zhang, TargetHistogram,
         KnownTargetEnum } from '../models/';

export class Parser {

  static parseURL(settings: Settings, classPath: string) {
    return settings.serverURL + '?' + settings.queryStr +
      '&classPath=luciusapi.' + classPath;
  }

  static parseClassPath(url: string): string {
    let queryString = url.substring(url.indexOf('?') + 1 );
    let start = queryString.indexOf('.') + 1;
    let end = queryString.length;
    return queryString.substring(start, end);
  }

  static parseRelatedCompounds(relatedCompounds: any): Array<string> {
    let relatedCompoundsArray = [];
    let i;
    for (i = 0; i < relatedCompounds.result.length ; i++) {
      relatedCompoundsArray.push(relatedCompounds.
        result[i][CompoundEnum.relatedJNJ].toString());
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

  static parseTopCorrelations(zhangArray: Array<Array<string>>,
    type: string, numComps: number): Array<Zhang> {
     let result = [];
     let subArray = [[]];

     if (type === 'POSITIVE') {
       subArray = zhangArray.slice(0, numComps);
     }else {
       subArray = zhangArray.reverse().slice(0, numComps);
     }

     for (let i = 0; i < numComps; i++) {
       let obj = <Zhang> new Object();
       obj.indexSorted = +subArray[i][0];
       obj.zhangScore = +subArray[i][1];
       obj.indexUnSorted = +subArray[i][2];
       obj.pwid = subArray[i][3];
       result[i] = obj;
     }
     return result;
  }

  static parseZhangData(zhangArray: Array<Array<string>>): Array<Zhang> {
    let result = [];

    for (let i = 0; i < zhangArray.length ; i++) {
      let obj = <Zhang> new Object();
      obj.indexSorted = +zhangArray[i][0];
      obj.zhangScore = +zhangArray[i][1];
      obj.indexUnSorted = +zhangArray[i][2];
      obj.pwid = zhangArray[i][3];
      result[i] = obj;
    }
    return result;
  }

  static parseSimilarityHistogramData(similarityHistogramResult: any) {
    let obj = <TargetHistogram> new Object();

    obj.metadata = similarityHistogramResult.metadata;
    obj.data = similarityHistogramResult.data;
    return obj;
  }

  static parseKnownTargetsData(knownTargetsArray: Array<Array<string>>) {
    let result = [];

    for (let i = 0; i < knownTargetsArray.length; i++) {
      let obj = <{'gene': string, 'frequency': number}> new Object();
      obj.gene = knownTargetsArray[i][KnownTargetEnum.gene];
      obj.frequency = +knownTargetsArray[i][KnownTargetEnum.frequency];
      result[i] = obj;
    }
    return result;
  }
}
