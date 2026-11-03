import {BDEFName} from ".";
import {Expression, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** field or association, possibly via associations, eg. "_Root.TotalPieces" */
export class BDEFFieldPath extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(BDEFName, starPrio(seq(".", BDEFName)));
  }
}
