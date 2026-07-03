import {alt, Expression, plus, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSAnnotation} from "../../cds/expressions";
import {DDLForeignKey, DDLValueHelp} from "./ddl_clauses";
import {DDLName} from "./ddl_name";

export class DDLExtend extends Expression {
  public getRunnable(): IStatementRunnable {
    const clause = alt(DDLForeignKey, DDLValueHelp);
    return seq(star(CDSAnnotation), "EXTEND", DDLName, ":", plus(clause), ";");
  }
}
