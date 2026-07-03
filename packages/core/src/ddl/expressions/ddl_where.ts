import {alt, Expression, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {DDLQualifiedName} from "./ddl_qualified_name";
import {DDLStringLiteral} from "./ddl_literal";

export class DDLWhere extends Expression {
  public getRunnable(): IStatementRunnable {
    const value = alt(DDLQualifiedName, DDLStringLiteral);
    const condition = seq(DDLQualifiedName, "=", value);
    return seq("WHERE", condition, star(seq("AND", condition)));
  }
}
