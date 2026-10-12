import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {Dynamic} from "../expressions/dynamic";
import {DatabaseTable} from "../expressions/database_table";
import {StatementSyntax} from "../_statement_syntax";
import {Source} from "../expressions/source";
import {ReferenceType} from "../_reference";
import {SyntaxInput} from "../_syntax_input";
import {AbstractType} from "../../types/basic/_abstract_type";
import {DatabaseTableSource} from "../expressions/database_table";
import {checkDatabaseWorkArea} from "../expressions/_check_database_work_area";

export class ModifyDatabase implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    for (const d of node.findAllExpressions(Expressions.Dynamic)) {
      Dynamic.runSyntax(d, input);
    }

    let dbSource: DatabaseTableSource = undefined;
    const dbtab = node.findFirstExpression(Expressions.DatabaseTable);
    if (dbtab !== undefined) {
      if (node.getChildren().length === 5) {
        const found = input.scope.findVariable(dbtab.concatTokens());
        if (found) {
          input.scope.addReference(dbtab.getFirstToken(), found, ReferenceType.DataWriteReference, input.filename);
        } else {
          dbSource = DatabaseTable.runSyntax(dbtab, input);
        }
      } else {
        dbSource = DatabaseTable.runSyntax(dbtab, input);
      }
    }

    const sourceTypes = new Map<ExpressionNode, AbstractType | undefined>();
    for (const s of node.findAllExpressions(Expressions.Source)) {
      sourceTypes.set(s, Source.runSyntax(s, input));
    }
    for (const s of node.findAllExpressions(Expressions.SimpleSource3)) {
      sourceTypes.set(s, Source.runSyntax(s, input));
    }

    checkDatabaseWorkArea(node, dbSource, sourceTypes, input);
  }
}