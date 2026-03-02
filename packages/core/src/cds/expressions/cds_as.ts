import {CDSName, CDSType} from ".";
import {Expression, seq, opt, alt} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSAs extends Expression {
  public getRunnable(): IStatementRunnable {
    // Greedy opt (not optPrio) — avoids exponential backtracking in CDSElement
    const colonType = seq(":", alt(CDSName, CDSType, "LOCALIZED"));
    return seq("AS", CDSName, opt(colonType));
  }
}