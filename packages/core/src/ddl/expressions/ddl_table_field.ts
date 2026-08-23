import {alt, Expression, optPrio, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSAnnotation} from "../../cds/expressions";
import {DDLForeignKey, DDLReference, DDLValueHelp} from "./ddl_clauses";
import {DDLName} from "./ddl_name";
import {DDLType} from "./ddl_type";

export class DDLTableField extends Expression {
  public getRunnable(): IStatementRunnable {
    const trailingClause = alt(DDLForeignKey, DDLReference, DDLValueHelp);
    return seq(
      star(CDSAnnotation),
      optPrio("KEY"),
      DDLName,
      ":",
      DDLType,
      optPrio("NOT NULL"),
      star(trailingClause),
      ";",
    );
  }
}
