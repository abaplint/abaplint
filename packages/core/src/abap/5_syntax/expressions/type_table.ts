import {ExpressionNode, StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {BasicTypes} from "../basic_types";
import * as Expressions from "../../2_statements/expressions";
import {UnknownType} from "../../types/basic";
import {ScopeType} from "../_scope_type";
import {TypeTableKey} from "./type_table_key";

export class TypeTable {
  public runSyntax(node: ExpressionNode | StatementNode, scope: CurrentScope,
                   filename: string, qualifiedNamePrefix?: string): TypedIdentifier | undefined {
    // todo, input is currently the statement, but should be the expression?
    let nameExpr = node.findFirstExpression(Expressions.DefinitionName);
    if (nameExpr === undefined) {
      nameExpr = node.findFirstExpression(Expressions.NamespaceSimpleName);
    }
    if (nameExpr === undefined) {
      return undefined;
    }
    const name = nameExpr.getFirstToken();

    let qualifiedName = qualifiedNamePrefix || "";
    if (node.getFirstToken().getStr().toUpperCase() === "TYPES") {
      qualifiedName = qualifiedName + name.getStr();
      if (scope.getType() === ScopeType.ClassDefinition
          || scope.getType() === ScopeType.Interface) {
        qualifiedName = scope.getName() + "=>" + qualifiedName;
      }
    }

    let type = new BasicTypes(filename, scope).parseTable(node, qualifiedName);
    if (type === undefined) {
      return new TypedIdentifier(name, filename, new UnknownType("TableType, fallback"));
    }

    for (const tt of node.findAllExpressions(Expressions.TypeTableKey)) {
      const error = new TypeTableKey().runSyntax(tt, type);
      if (error) {
        type = error;
      }
    }

    return new TypedIdentifier(name, filename, type);
  }
}