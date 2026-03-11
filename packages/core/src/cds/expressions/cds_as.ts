import {CDSName, CDSType} from ".";
import {Expression, seq, optPrio, altPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSAs extends Expression {
  public getRunnable(): IStatementRunnable {
    const redirected = seq(": REDIRECTED TO", optPrio(altPrio("PARENT", "COMPOSITION CHILD")), CDSName);
    const colonType = seq(":", altPrio(CDSType, CDSName, "LOCALIZED"));
    return seq("AS", CDSName, optPrio(altPrio(redirected, colonType)));
  }
}