import {alt, Expression, optPrio, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSAnnotation} from "../../cds/expressions";
import {DDLForeignKey, DDLValueHelp} from "./ddl_clauses";
import {DDLName} from "./ddl_name";

export class DDLNamedInclude extends Expression {
  public getRunnable(): IStatementRunnable {
    const trailingClause = alt(DDLForeignKey, DDLValueHelp);
    return seq(
      star(CDSAnnotation),
      optPrio("KEY"),
      DDLName,
      ":",
      "INCLUDE",
      DDLName,
      optPrio(seq("WITH", "SUFFIX", DDLName)),
      optPrio("NOT NULL"),
      star(trailingClause),
      ";",
    );
  }
}
