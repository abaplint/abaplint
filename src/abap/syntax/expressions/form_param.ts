import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";
import {Field} from "../../2_statements/expressions";

export class FormParam {
  public runSyntax(node: ExpressionNode, _scope: CurrentScope, filename: string): TypedIdentifier {
    const token = node.findFirstExpression(Field)!.getFirstToken();
    return new TypedIdentifier(token, filename, new UnknownType("FormParam, todo"));
  }
}