import {VariableDeclaration} from "ts-morph";
import {handleExpression} from "../expressions";
import {handleType} from "../types";
import {MorphSettings} from "../statements";

export class MorphVariableDeclaration {
  public run(d: VariableDeclaration, settings: MorphSettings) {
    let ret = "";

    const expr = handleExpression(d.getInitializer(), settings);
//    console.dir(expr);
    if (expr === "undefined" || expr === "VALUE #( )" || expr === "") {
      ret += `DATA ${d.getName()} TYPE ` + handleType(d.getType(), settings) + ".\n";
      ret += `CLEAR ${d.getName()}.\n`;
    } else {
      ret += `DATA(${d.getName()}) = ` + expr + ".\n";
    }

    return ret;
  }
}