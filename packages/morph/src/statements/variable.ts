import {VariableStatement} from "ts-morph";
import {MorphVariableDeclaration} from "../expressions/variable_declaration";
import {MorphSettings} from "../statements";

export class MorphVariable {
  public run(s: VariableStatement, settings: MorphSettings) {
    let ret = "";

    for (const d of s.getDeclarations()) {
      ret += new MorphVariableDeclaration().run(d, settings);
    }

    return ret;
  }
}