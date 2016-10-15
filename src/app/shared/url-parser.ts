import { Settings } from '../models/settings';

export class Parser {
  static parseURL(settings: Settings, classPath: string) {
    return settings.serverURL + '?' + settings.queryStr + '&classPath=luciusapi.' + classPath;
  }

  static parseClassPath(url: string) {
    let queryString = url.substring(url.indexOf('?') + 1 );
    let start = queryString.indexOf('.') + 1;
    let end = queryString.length;
    return queryString.substring(start, end);
  }
}
