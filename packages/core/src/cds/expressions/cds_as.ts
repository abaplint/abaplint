import {CDSName, CDSType} from ".";
import {Expression, seq, optPrio, altPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSAs extends Expression {
  public getRunnable(): IStatementRunnable {
    const colonType = seq(":", altPrio(CDSType, CDSName, "LOCALIZED"));
    return seq("AS", CDSName, optPrio(colonType));
  }
}