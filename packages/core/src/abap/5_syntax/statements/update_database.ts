import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {ScopeType} from "../_scope_type";
import {StructureType} from "../../types/basic";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {Identifier} from "../../1_lexer/tokens/identifier";
import {DatabaseTable} from "../expressions/database_table";
import {Dynamic} from "../expressions/dynamic";
import {StatementSyntax} from "../_statement_syntax";

export class UpdateDatabase implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    const dbtab = node.findFirstExpression(Expressions.DatabaseTable);
    if (dbtab !== undefined) {
      new DatabaseTable().runSyntax(dbtab, scope, filename);
    }

    const tableName = node.findDirectExpression(Expressions.DatabaseTable);
    const tokenName = tableName?.getFirstToken();
    if (tableName && tokenName) {
      // todo, this also finds structures, it should only find transparent tables
      const found = scope.getDDIC().lookupTable(tokenName.getStr());
      if (found instanceof StructureType) {
        scope.push(ScopeType.OpenSQL, "UPDATE", tokenName.getStart(), filename);
        for (const field of found.getComponents()) {
          const fieldToken = new Identifier(node.getFirstToken().getStart(), field.name);
          const id = new TypedIdentifier(fieldToken, filename, field.type);
          scope.addIdentifier(id);
        }
      }
    }

    for (const s of node.findAllExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    for (const d of node.findAllExpressions(Expressions.Dynamic)) {
      new Dynamic().runSyntax(d, scope, filename);
    }

    if (scope.getType() === ScopeType.OpenSQL) {
      scope.pop(node.getLastToken().getEnd());
    }

  }
}