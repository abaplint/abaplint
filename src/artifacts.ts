import {IRule} from "./rules/_rule";
import * as Rules from "./rules/";

export class Artifacts {

  public static getRules(): IRule[] {
    let ret: IRule[] = [];

    for (let key in Rules) {
      const list: any = Rules;
      if (typeof list[key] === "function") {
        let rule: IRule = new list[key]();
// note that configuration is also exported from rules
        if (rule.getKey) {
          ret.push(rule);
        }
      }
    }

    return ret;
  }

  public static getObjects(): undefined {
// todo
    return undefined;
  }

  public static getFormatters(): undefined {
// todo
    return undefined;
  }

}