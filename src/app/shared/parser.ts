import {
  Settings, CompoundEnum, Zhang, TargetHistogram,
  KnownTargetEnum, AnnotatedPlatewellid
} from '../models/';

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
    let queryString = url.substring(url.indexOf('?') + 1);
    let start = queryString.indexOf('.') + 1;
    let end = queryString.length;
    return queryString.substring(start, end);
  }

  static parseRelatedCompounds(relatedCompounds): string[] {
    let relatedCompoundsArray: string[] = Array();
    for (let i = 0; i < relatedCompounds.result.length; i++) {
      relatedCompoundsArray[i] = (relatedCompounds.
        result[i][CompoundEnum.relatedJNJ].toString());
    }
    return relatedCompoundsArray;
  }

  static parseSimiliarityValues(zhangArray: Array<Array<string>>): number[] {
    let zhangValues: number[] = Array();
    for (let i = 0; i < zhangArray.length; i++) {
      zhangValues[i] = (+zhangArray[i][1]);
    }
    return zhangValues;
  }

  static parsePwids(zhangArray: Zhang[]): string {
    let pwids: string[] = Array();
    for (let i = 0; i < zhangArray.length; i++) {
      pwids[i] = zhangArray[i].pwid;
    }
    return pwids.toString().replace(/,/g, ' ');
  }

  static parseTopCorrelations(
    zhangArray: Zhang[], type: string,
    numComps: number
  ): Zhang[] {

    let result: Zhang[];
    let subArray: Zhang[];

    if (type === 'POSITIVE') {
      subArray = zhangArray.slice(0, numComps);
    } else {
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

  static parseZhangData(zhang): Zhang[] {

    let result: Zhang[] = Array();

    for (let i = 0; i < zhang.length; i++) {
      let obj = <Zhang>{};
      obj.indexSorted = +zhang[i][0];
      obj.zhangScore = +zhang[i][1];
      obj.indexUnSorted = +zhang[i][2];
      obj.pwid = zhang[i][3];
      result[i] = obj;
    }
    return result;
  }

  static parseSimilarityHistogramData(histogram): TargetHistogram {

    let obj = <TargetHistogram>{};

    obj.metadata = histogram.metadata;
    obj.data = histogram.data;
    return obj;
  }

  static parseKnownTargetsData(knownTargets): KnownTarget[] {
    let result: KnownTarget[] = Array();

    for (let i = 0; i < knownTargets.length; i++) {
      let obj = <KnownTarget>{};
      obj.gene = knownTargets[i][KnownTargetEnum.gene];
      obj.frequency = +knownTargets[i][KnownTargetEnum.frequency];
      result[i] = obj;
    }
    return result;
  }

  static parseAnnotatedPlateWellids(ids): AnnotatedPlatewellid[] {
    return ids;
  }
}
