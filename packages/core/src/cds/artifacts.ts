import * as Expressions from "./expressions";
import {Expression} from "../abap/2_statements/combi";

export class ArtifactsCDS {

  public static getExpressions(): (new () => Expression)[] {
    const ret: (new () => Expression)[] = [];

    const list: any = Expressions;
    for (const key in Expressions) {
      if (typeof list[key] === "function") {
        ret.push(list[key]);
      }
    }

    return ret;
  }

}