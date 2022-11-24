import {BinaryExpression} from "ts-morph";
import {handleExpressions} from "../expressions";

export class MorphBinary {
  public run(s: BinaryExpression) {
    let ret = handleExpressions(s.forEachChildAsArray());
    if (ret.endsWith(" EQ undefined")) {
      ret = ret.replace(" EQ undefined", " IS INITIAL");
    }
    return ret;
  }
}