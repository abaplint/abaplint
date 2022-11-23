import {ReturnStatement} from "ts-morph";
import {handleExpressions} from "../expressions";

export class MorphReturn {
  public run(s: ReturnStatement) {
    let ret = "return = ";
    ret += handleExpressions(s.forEachChildAsArray());
    return ret + ".\nRETURN.\n";
  }
}