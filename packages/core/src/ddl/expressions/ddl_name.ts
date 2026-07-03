import {alt, Expression, regex} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSName} from "../../cds/expressions/cds_name";

export class DDLName extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(CDSName, regex(/^"[^"]*"$/));
  }
}
