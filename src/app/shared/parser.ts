import { Settings, Zhang } from '../models';

export class Parser {

  /* create and return API URL based on classPath */
  static parseURL(settings: Settings, classPath: string): string {
    return settings.serverURL + '?' + settings.queryStr +
      '&classPath=luciusapi.' + classPath;
  }

  /* utility method to get Pwids from Zhang Data */
  static parsePwids(zhangArray: Zhang[]): string {
    let pwids: string[] = Array();
    for (let i = 0; i < zhangArray.length; i++) {
      pwids[i] = zhangArray[i].pwid;
    }
    return pwids.toString().replace(/,/g, ' ');
  }
}
