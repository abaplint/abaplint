import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {ScopeType} from "../_scope_type";
import {StructureType} from "../../types/basic";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {Identifier} from "../../1_lexer/tokens/identifier";
import {DatabaseTable} from "../expressions/database_table";
import {Dynamic} from "../expressions/dynamic";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class UpdateDatabase implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    const dbtab = node.findFirstExpression(Expressions.DatabaseTable);
    if (dbtab !== undefined) {
      DatabaseTable.runSyntax(dbtab, input);
    }

    const tableName = node.findDirectExpression(Expressions.DatabaseTable);
    const tokenName = tableName?.getFirstToken();
    if (tableName && tokenName) {
      // todo, this also finds structures, it should only find transparent tables
      const found = input.scope.getDDIC().lookupTable(tokenName.getStr());
      if (found instanceof StructureType) {
        input.scope.push(ScopeType.OpenSQL, "UPDATE", tokenName.getStart(), input.filename);
        for (const field of found.getComponents()) {
          const fieldToken = new Identifier(node.getFirstToken().getStart(), field.name);
          const id = new TypedIdentifier(fieldToken, input.filename, field.type);
          input.scope.addIdentifier(id);
        }
      }
    }

    for (const s of node.findAllExpressions(Expressions.Source)) {
      Source.runSyntax(s, input);
    }
    for (const s of node.findAllExpressions(Expressions.SimpleSource3)) {
      Source.runSyntax(s, input);
    }

    for (const d of node.findAllExpressions(Expressions.Dynamic)) {
      Dynamic.runSyntax(d, input);
    }

    if (input.scope.getType() === ScopeType.OpenSQL) {
      input.scope.pop(node.getLastToken().getEnd());
    }

  }
}