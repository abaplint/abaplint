import {CallExpression} from "ts-morph";
import {handleExpression} from "../expressions";

export class MorphCall {
  public run(s: CallExpression) {
//    s.getArguments

    const expr = s.getExpression();
    let ret = handleExpression(expr);

    const name = expr.getType().getSymbol()?.getName();
    const signature = expr.getType().getText();
    let parameterNames: string[] = [];

    if (name === "trim" && signature === "() => string") {
      parameterNames.push("foo");
    } else if (name === "substr" && signature === "(from: number, length?: number) => string") {
      parameterNames.push("off");
      parameterNames.push("len");
    } else if (expr.constructor.name === "SuperExpression" && expr.getText() === "super") {
      parameterNames = expr.getType().getConstructSignatures()[0].getParameters().map(p => p.getEscapedName());
      ret += "->constructor(";
    } else {
      ret += "(";
    }

    for (const a of s.getArguments()) {
      const name = parameterNames.pop();
      if (name !== undefined && name !== "") {
        ret += " " + name + " = " + handleExpression(a);
      } else {
        ret += " " + handleExpression(a);
      }
    }

    ret += " )";

    return ret;
  }
}