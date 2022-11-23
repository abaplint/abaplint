import {ArrayLiteralExpression, AsExpression, BinaryExpression, CallExpression, FalseLiteral, Identifier, NewExpression, Node, NoSubstitutionTemplateLiteral, NumericLiteral, ParenthesizedExpression, PrefixUnaryExpression, PropertyAccessExpression, StringLiteral, SuperExpression, SyntaxKind, ThisExpression, TrueLiteral} from "ts-morph";
import {MorphBinary} from "./expressions/binary";
import {MorphCall} from "./expressions/call";
import {MorphNew} from "./expressions/new";
import {MorphPropertyAccess} from "./expressions/property_access";

export function handleExpression(n?: Node): string {
  if (n === undefined) {
    return "";
  }

  let ret = "";
  const text = n.getText();

  if (n instanceof BinaryExpression) {
    ret += new MorphBinary().run(n);
  } else if (n instanceof NoSubstitutionTemplateLiteral) {
    ret += "|" + n.getLiteralText() + "|";
  } else if (n instanceof StringLiteral) {
    ret += "|" + n.getLiteralText()
      .replace(/\n/g, "\\n")
      .replace(/\t/g, "\\t")
      .replace(/{/g, "\\{")
      .replace(/\|/g, "\\|") + "|";
  } else if (n instanceof NewExpression) {
    ret += new MorphNew().run(n);
  } else if (n instanceof SuperExpression) {
    ret += "super";
  } else if (n instanceof AsExpression) {
    ret += `CAST ${n.getType().getSymbol()?.getName()}( ${handleExpression(n.getExpression())} )`;
  } else if (n instanceof ArrayLiteralExpression) {
    ret += "VALUE #( )";
  } else if (n instanceof CallExpression) {
    ret += new MorphCall().run(n);
  } else if (n instanceof PropertyAccessExpression) {
    ret += new MorphPropertyAccess().run(n);
  } else if (n instanceof NumericLiteral) {
    ret += text;
  } else if (n instanceof PrefixUnaryExpression) {
    switch (n.getOperatorToken()) {
      case SyntaxKind.ExclamationToken:
        ret += "NOT ";
        break;
      default:
        console.dir("PrefixUnaryExpression todo");
        break;
    }
    ret += handleExpression(n.getOperand());
  } else if (n instanceof FalseLiteral) {
    ret += "abap_false";
  } else if (n instanceof ParenthesizedExpression) {
    ret += "( " + handleExpression(n.getExpression()) + " )";
  } else if (n instanceof ThisExpression) {
    ret += "me";
  } else if (n instanceof TrueLiteral) {
    ret += "abap_true";
  } else if (n instanceof Identifier) {
    ret += text;
  } else if (text === "&&") {
    ret += " AND ";
  } else if (text === "||") {
    ret += " OR ";
  } else if (text === "instanceof") {
    ret += " IS INSTANCE OF ";
  } else if (text === "===") {
    ret += " EQ ";
  } else if (text === "!==") {
    ret += " NE ";
  } else if (text === "%") {
    ret += " MOD ";
  } else if (text === "+" || text === "-" || text === "=" || text === "<" || text === ">" || text === "<=" || text === ">=") {
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