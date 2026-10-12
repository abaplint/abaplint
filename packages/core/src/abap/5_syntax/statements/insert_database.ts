import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {Dynamic} from "../expressions/dynamic";
import {DatabaseTable} from "../expressions/database_table";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";
import {AbstractType} from "../../types/basic/_abstract_type";
import {checkDatabaseWorkArea} from "../expressions/_check_database_work_area";

export class InsertDatabase implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    const sourceTypes = new Map<ExpressionNode, AbstractType | undefined>();
    for (const s of node.findAllExpressions(Expressions.Source)) {
      sourceTypes.set(s, Source.runSyntax(s, input));
    }
    for (const s of node.findAllExpressions(Expressions.SimpleSource3)) {
      sourceTypes.set(s, Source.runSyntax(s, input));
    }

    for (const d of node.findAllExpressions(Expressions.Dynamic)) {
      Dynamic.runSyntax(d, input);
    }

    const dbtab = node.findFirstExpression(Expressions.DatabaseTable);
    if (dbtab !== undefined) {
      const dbSource = DatabaseTable.runSyntax(dbtab, input);
      checkDatabaseWorkArea(node, dbSource, sourceTypes, input);
    }

  }
}