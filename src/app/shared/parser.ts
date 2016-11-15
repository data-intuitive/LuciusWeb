import { Settings, CompoundEnum, Zhang, TargetHistogram,
         KnownTargetEnum, AnnotatedPlatewellid } from '../models/';

interface KnownTarget {
  gene: string;
  frequency: number;
}

export class Parser {

  static parseURL(settings: Settings, classPath: string): string {
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
    let relatedCompoundsArray: string[] = Array();
    for (let i = 0; i < relatedCompounds.result.length ; i++) {
      relatedCompoundsArray[i] = (relatedCompounds.
        result[i][CompoundEnum.relatedJNJ].toString());
    }
    return relatedCompoundsArray;
  }

  static parseSimiliarityValues(zhangArray: Array<Array<string>>):
   Array<number> {

      let zhangValues: number[] = Array();
      for (let i = 0; i < zhangArray.length; i++) {
        zhangValues[i] = (+zhangArray[i][1]);
      }
      return zhangValues;
  }

  static parsePwids(zhangArray: Array<Zhang>):
   string {

      let pwids: string[] = Array();
      for (let i = 0; i < zhangArray.length ; i++) {
        pwids[i] = zhangArray[i].pwid;
      }
      return pwids.toString().replace(/,/g , ' ');
  }

  static parseTopCorrelations(zhangArray: Array<Zhang>, type: string,
     numComps: number): Array<Zhang> {

       let result: Zhang[] = Array();
       let subArray: Zhang[] = Array();

       if (type === 'POSITIVE') {
         subArray = zhangArray.slice(0, numComps);
       }else {
         subArray = zhangArray.reverse().slice(0, numComps);
       }

       for (let i = 0; i < numComps; i++) {
         let obj = <Zhang>{};
         obj.indexSorted = +subArray[i].indexSorted;
         obj.zhangScore = +subArray[i].zhangScore;
         obj.indexUnSorted = +subArray[i].indexUnSorted;
         obj.pwid = subArray[i].pwid;
         result[i] = obj;
       }
       return result;
  }

  static parseZhangData(zhang: any):
   Array<Zhang> {

      let zhangArray = zhang.result;
      let result: Zhang[] = Array();

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

  static parseSimilarityHistogramData(similarityHistogram: any):
    TargetHistogram {

      let simHistResult = similarityHistogram.result;
      let obj = <TargetHistogram>{};

      obj.metadata = simHistResult.metadata;
      obj.data = simHistResult.data;
      return obj;
  }

  static parseKnownTargetsData(knownTargetsArray: any):
    Array<KnownTarget> {

      let result: KnownTarget[] = Array();

      for (let i = 0; i < knownTargetsArray.length; i++) {
        let obj = <KnownTarget>{};
        obj.gene = knownTargetsArray[i][KnownTargetEnum.gene];
        obj.frequency = +knownTargetsArray[i][KnownTargetEnum.frequency];
        result[i] = obj;
      }
      return result;
  }

  static parseAnnotatedPlateWellids(annotatedplatewellids: any):
    Array<AnnotatedPlatewellid> {

      let annotatedPlateWellids = annotatedplatewellids.result;
      return annotatedPlateWellids;
  }
}
