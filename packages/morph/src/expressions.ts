import {BinaryExpression, CallExpression, FalseLiteral, Identifier, Node, NumericLiteral, PropertyAccessExpression, StringLiteral, ThisExpression, TrueLiteral} from "ts-morph";
import {MorphBinary} from "./expressions/binary";
import {MorphCall} from "./expressions/call";
import {MorphPropertyAccess} from "./expressions/property_access";

export function handleExpression(n: Node): string {
  let ret = "";
  const text = n.getText();

  if (n instanceof BinaryExpression) {
    ret += new MorphBinary().run(n);
  } else if (n instanceof StringLiteral) {
    ret += "`" + n.getLiteralText() + "`";
  } else if (n instanceof CallExpression) {
    ret += new MorphCall().run(n);
  } else if (n instanceof PropertyAccessExpression) {
    ret += new MorphPropertyAccess().run(n);
  } else if (n instanceof NumericLiteral) {
    ret += text;
  } else if (n instanceof FalseLiteral) {
    ret += "abap_false";
  } else if (n instanceof ThisExpression) {
    ret += "me";
  } else if (n instanceof TrueLiteral) {
    ret += "abap_true";
  } else if (n instanceof Identifier) {
    ret += text;
  } else if (text === "===") {
    ret += " EQ ";
  } else if (text === "+" || text === "-" || text === "=" || text === "<" || text === ">") {
    ret += " " + text + " ";
  } else {
    console.dir(n.constructor.name + " \"" + n.getText() + "\" - handleExpressions");
  }
  return ret;
}

export function handleExpressions(nodes: Node[]): string {
  let ret = "";
  for (const n of nodes) {
    ret += handleExpression(n);
  }
  return ret;
}