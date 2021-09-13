import {IRule} from "./rules/_irule";
import * as Rules from "./rules";

export class ArtifactsRules {

  public static getRules(): IRule[] {
    const ret: IRule[] = [];
    const list: any = Rules;
    for (const key in Rules) {
      if (typeof list[key] === "function") {
        const rule: IRule = new list[key]();
// note that configuration is also exported from rules
        if (rule.getMetadata !== undefined) {
          ret.push(rule);
        }
      }
    }
    return ret;
  }

}