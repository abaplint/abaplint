import {VariableStatement} from "ts-morph";
import {handleExpression} from "../expressions";

export class MorphVariable {
  public run(s: VariableStatement) {
    let ret = "";

    for (const d of s.getDeclarations()) {
      ret += `DATA(${d.getName()}) = `;
      ret += handleExpression(d.getInitializer());
    }

    return ret + ".\n";
  }
}