import {Expression, regex, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSAnnotation extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(regex(/@AbapCatalog.sqlViewName:/), regex(/'\w+'/));
  }
}