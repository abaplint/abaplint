import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";
import {Field, SimpleName} from "../../2_statements/expressions";
import {BasicTypes} from "../basic_types";

export class FormParam {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string): TypedIdentifier {
    const nameToken = node.findFirstExpression(Field)?.getFirstToken();

    const bfound = new BasicTypes(filename, scope).parseType(node);
    if (nameToken && bfound) {
      return new TypedIdentifier(nameToken, filename, bfound);
    }

    if (nameToken) {
      return new TypedIdentifier(nameToken, filename, new UnknownType("FormParam, todo"));
    }

    const simple = node.findDirectExpression(SimpleName);
    if (simple !== undefined) {
      const typ = new UnknownType("todo, FORM STRUCTURES typing");
      return new TypedIdentifier(simple.getFirstToken(), filename, typ);
    }

    throw new Error("FormParam, unexpected node");
  }
}