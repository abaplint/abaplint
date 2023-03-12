import {VariableDeclaration} from "ts-morph";
import {handleExpression} from "../expressions";
import {handleType} from "../types";

export class MorphVariableDeclaration {
  public run(d: VariableDeclaration) {
    let ret = "";

    const expr = handleExpression(d.getInitializer());
//    console.dir(expr);
    if (expr === "undefined" || expr === "VALUE #( )" || expr === "") {
      ret += `DATA ${d.getName()} TYPE ` + handleType(d.getType()) + ".\n";
      ret += `CLEAR ${d.getName()}.\n`;
    } else {
      ret += `DATA(${d.getName()}) = ` + expr + ".\n";
    }

    return ret;
  }
}