import {CallExpression} from "ts-morph";
import {handleExpression} from "../expressions";

export class MorphCall {
  public run(s: CallExpression) {
//    s.getArguments

    const expr = s.getExpression();
    let ret = handleExpression(expr);
    let post = "";

    const name = expr.getType().getSymbol()?.getName();
    const signature = expr.getType().getText();
    let parameterNames: string[] = [];
//    console.dir(signature);

    if (name === "trim" && signature === "() => string") {
      parameterNames = [];
      post = " )";
    } else if (name === "toUpperCase" && signature === "() => string") {
      parameterNames = [];
      post = " )";
    } else if (name === "replace") {
      parameterNames.push("regex");
      parameterNames.push("with");
      post = " )";
    } else if (name === "push") {
      ret += "(";
      post = " ) )";
    } else if (name === "split") {
      ret += `
  split_by    =`;
      post = `
  offset      = 0
  IN
  INIT string_result = VALUE string_table( )
       add = ||
  FOR index = 0 WHILE index <= strlen( split_input )
  NEXT
  string_result = COND #(
      WHEN index = strlen( split_input ) OR split_input+index(1) = split_by
      THEN VALUE #( BASE string_result ( add ) )
      ELSE string_result )
    add    = COND #(
      WHEN index = strlen( split_input ) OR split_input+index(1) = split_by
      THEN ||
      ELSE |{ add }{ split_input+index(1) }| ) )`;
    } else if (name === "charAt" && signature === "(pos: number) => string") {
      parameterNames.push("off");
      post = " )";
    } else if (name === "substr" && signature === "(from: number, length?: number) => string") {
      parameterNames.push("off");
      parameterNames.push("len");
      post = " )";
    } else if (expr.constructor.name === "SuperExpression" && expr.getText() === "super") {
      parameterNames = expr.getType().getConstructSignatures()[0].getParameters().map(p => p.getEscapedName());
      ret += "->constructor(";
      post = " )";
    } else {
      ret += "(";
      post = " )";
    }
    parameterNames = parameterNames.reverse();

    for (const a of s.getArguments()) {
      const name = parameterNames.pop();
      if (name !== undefined && name !== "") {
        ret += " " + name + " = " + handleExpression(a);
      } else {
        ret += " " + handleExpression(a);
      }
    }

    ret += post;

    return ret;
  }
}