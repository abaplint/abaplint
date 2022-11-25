import {ArrayLiteralExpression, AsExpression, BinaryExpression, CallExpression, ElementAccessExpression, FalseLiteral, Identifier, NewExpression, Node, NoSubstitutionTemplateLiteral, NumericLiteral, ObjectLiteralExpression, ParenthesizedExpression, PrefixUnaryExpression, PropertyAccessExpression, RegularExpressionLiteral, StringLiteral, SuperExpression, SyntaxKind, ThisExpression, TrueLiteral, VariableDeclaration, VariableDeclarationList} from "ts-morph";
import {MorphBinary} from "./expressions/binary";
import {MorphCall} from "./expressions/call";
import {MorphElementAccess} from "./expressions/element_access";
import {MorphNew} from "./expressions/new";
import {MorphObjectLiteral} from "./expressions/object_literal";
import {MorphPropertyAccess} from "./expressions/property_access";
import {MorphVariableDeclaration} from "./expressions/variable_declaration";

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
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/\t/g, "\\t")
      .replace(/{/g, "\\{")
      .replace(/}/g, "\\}")
      .replace(/\|/g, "\\|") + "|";
  } else if (n instanceof ObjectLiteralExpression) {
    ret += new MorphObjectLiteral().run(n);
  } else if (n instanceof ElementAccessExpression) {
    ret += new MorphElementAccess().run(n);
  } else if (n instanceof NewExpression) {
    ret += new MorphNew().run(n);
  } else if (n instanceof SuperExpression) {
    ret += "super";
  } else if (n instanceof AsExpression) {
    ret += `CAST ${n.getType().getSymbol()?.getName()}( ${handleExpression(n.getExpression())} )`;
  } else if (n instanceof ArrayLiteralExpression) {
    ret += "VALUE #( )";
  } else if (n instanceof RegularExpressionLiteral) {
    // todo, take care of case insensitive and occurrences, ie. flags from regex
    ret += "|" + n.getLiteralText().replace(/^\//, "").replace(/\/\w+$/, "") + "|";
  } else if (n instanceof CallExpression) {
    ret += new MorphCall().run(n);
  } else if (n instanceof VariableDeclarationList) {
    ret += n.getDeclarations().map(new MorphVariableDeclaration().run).join("");
  } else if (n instanceof VariableDeclaration) {
    ret += new MorphVariableDeclaration().run(n);
  } else if (n instanceof PropertyAccessExpression) {
    ret += new MorphPropertyAccess().run(n);
  } else if (n instanceof NumericLiteral) {
    ret += text;
  } else if (n instanceof PrefixUnaryExpression) {
    switch (n.getOperatorToken()) {
      case SyntaxKind.MinusToken:
        ret += "-";
        break;
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
    ret += " OR\n";
  } else if (text === "instanceof") {
    ret += " IS INSTANCE OF ";
  } else if (text === "===") {
    ret += " EQ ";
  } else if (text === "!==") {
    ret += " NE ";
  } else if (text === "%") {
    ret += " MOD ";
  } else if (text === "+" || text === "+=" || text === "-" || text === "="
      || text === "<" || text === ">" || text === "<=" || text === ">=") {
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