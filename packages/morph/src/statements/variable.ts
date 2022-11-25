import {VariableStatement} from "ts-morph";
import {MorphVariableDeclaration} from "../expressions/variable_declaration";

export class MorphVariable {
  public run(s: VariableStatement) {
    let ret = "";

    for (const d of s.getDeclarations()) {
      ret += new MorphVariableDeclaration().run(d);
    }

    return ret;
  }
}