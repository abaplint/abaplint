import {CDSAnnotation, CDSName} from ".";
import {Expression, optPrio, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSElement extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(star(CDSAnnotation), optPrio("KEY"), CDSName, optPrio(seq("AS", CDSName)));
  }
}