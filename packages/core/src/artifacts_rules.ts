import {IRule} from "./rules/_irule";
import * as Rules from "./rules";

export class ArtifactsRules {

  public static getRules(): IRule[] {
    const ret: IRule[] = [];
    for (const key in Rules) {
      const list: any = Rules;
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