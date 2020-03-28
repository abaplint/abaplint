import * as Types from "../../types/basic";
import {ExpressionNode, StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {BasicTypes} from "../basic_types";
import * as Expressions from "../../2_statements/expressions";

export class TypeTable {
  public runSyntax(node: ExpressionNode | StatementNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    // todo, input is currently the statement, but should be the expression?
    const nameExpr = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (nameExpr === undefined) {
      return undefined;
    }
    const name = nameExpr.getFirstToken();

    const tab = node.findFirstExpression(Expressions.TypeTable);
    if (tab === undefined) {
      return undefined;
    }

    const row = new BasicTypes(filename, scope).resolveTypeName(node, node.findFirstExpression(Expressions.TypeName));
    if (row === undefined) {
      return undefined;
    }

    return new TypedIdentifier(name, filename, new Types.TableType(row));
  }
}