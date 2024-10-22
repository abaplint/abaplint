import {CDSAs, CDSName, CDSParametersSelect} from ".";
import {Expression, opt, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSSource extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(CDSName, opt(CDSParametersSelect), opt(CDSAs));
  }
}