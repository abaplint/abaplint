import {ExpressionNode, StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {BasicTypes} from "../basic_types";
import * as Expressions from "../../2_statements/expressions";
import {UnknownType} from "../../types/basic";

export class TypeTable {
  public runSyntax(node: ExpressionNode | StatementNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    // todo, input is currently the statement, but should be the expression?
    const nameExpr = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (nameExpr === undefined) {
      return undefined;
    }
    const name = nameExpr.getFirstToken();
    const type = new BasicTypes(filename, scope).parseType(node);
    if (type === undefined) {
      return new TypedIdentifier(name, filename, new UnknownType("TableType, fallback"));
    }
    return new TypedIdentifier(name, filename, type);
  }
}