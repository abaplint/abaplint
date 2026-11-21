import {ExpressionNode, StatementNode} from "../../nodes";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {BasicTypes} from "../basic_types";
import * as Expressions from "../../2_statements/expressions";
import {TableAccessType, TableType, UnknownType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {ScopeType} from "../_scope_type";
import {TypeTableKey} from "./type_table_key";
import {SyntaxInput} from "../_syntax_input";

export class TypeTable {
  public static runSyntax(node: ExpressionNode | StatementNode, input: SyntaxInput,
                          qualifiedNamePrefix?: string): TypedIdentifier | undefined {
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
      if (input.scope.getType() === ScopeType.ClassDefinition
          || input.scope.getType() === ScopeType.Interface) {
        qualifiedName = input.scope.getName() + "=>" + qualifiedName;
      }
    }

    let type = new BasicTypes(input).parseTable(node, qualifiedName);
    if (type === undefined) {
      return new TypedIdentifier(name, input.filename, new UnknownType("TableType, fallback"));
    }

    const keys = node.findAllExpressions(Expressions.TypeTableKey);
    TypeTable.checkUniqueness(keys, type);

    for (const tt of keys) {
      const error = TypeTableKey.runSyntax(tt, type);
      if (error) {
        type = error;
      }
    }

    return new TypedIdentifier(name, input.filename, type);
  }

  private static checkUniqueness(keys: readonly ExpressionNode[], type: AbstractType): void {
    for (const key of keys) {
      if (key.concatTokens().toUpperCase().startsWith("WITH UNIQUE EMPTY KEY")) {
        throw new Error("EMPTY KEY cannot be UNIQUE");
      }
    }

    // the primary key comes first, it is unnamed or named PRIMARY_KEY
    const first = keys[0];
    const keyName = first?.findDirectExpression(Expressions.Field)?.concatTokens().toUpperCase();
    if (type instanceof TableType
        && type.getAccessType() === TableAccessType.hashed
        && first !== undefined
        && (keyName === undefined || keyName === "PRIMARY_KEY")
        && first.concatTokens().toUpperCase().startsWith("WITH NON-UNIQUE ")) {
      throw new Error("HASHED tables cannot have NON-UNIQUE key");
    }
  }
}