import {BinaryExpression, Identifier, Node, PropertyAccessExpression, StringLiteral} from "ts-morph";
import {MorphBinary} from "./expressions/binary";
import {MorphPropertyAccess} from "./expressions/property_access";

export function handleExpressions(nodes: Node[]): string {
  let ret = "";
  for (const n of nodes) {
    const text = n.getText();

    if (n instanceof BinaryExpression) {
      ret += new MorphBinary().run(n);
    } else if (n instanceof StringLiteral) {
      ret += "`" + n.getLiteralText() + "`";
    } else if (n instanceof PropertyAccessExpression) {
      ret += new MorphPropertyAccess().run(n);
    } else if (n instanceof Identifier) {
      ret += text;
    } else if (text === "+" || text === "=") {
      ret += " " + text + " ";
    } else {
      console.dir(n.constructor.name + " " + n.getText());
    }
  }
  return ret;
}