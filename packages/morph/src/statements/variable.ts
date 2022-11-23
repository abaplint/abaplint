import {VariableStatement} from "ts-morph";
import {handleExpression} from "../expressions";
import {handleType} from "../types";

export class MorphVariable {
  public run(s: VariableStatement) {
    let ret = "";

    for (const d of s.getDeclarations()) {
      const expr = handleExpression(d.getInitializer());
      if (expr === "undefined" || expr === "VALUE #( )") {
        ret += `DATA ${d.getName()} TYPE ` + handleType(d.getType()) + ".\n";
        ret += `CLEAR ${d.getName()}`;
      } else {
        ret += `DATA(${d.getName()}) = ` + expr;
      }
    }

    return ret + ".\n";
  }
}