import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";
import {Field, SimpleName, NamespaceSimpleName} from "../../2_statements/expressions";
import {BasicTypes} from "../basic_types";
import {AbstractType} from "../../types/basic/_abstract_type";

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
      // STRUCTURES typing
      const typeName = node.findDirectExpression(NamespaceSimpleName)?.getFirstToken().getStr();
      let type: AbstractType | undefined = undefined;
      if (typeName) {
        type = scope.findType(typeName)?.getType();
        if (type === undefined) {
          type = scope.getDDIC().lookupTableOrView(typeName);
        }
      } else {
        type = new UnknownType("todo, FORM STRUCTURES typing");
      }
      return new TypedIdentifier(simple.getFirstToken(), filename, type);
    }

    throw new Error("FormParam, unexpected node");
  }
}