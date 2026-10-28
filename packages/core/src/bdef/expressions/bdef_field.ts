import {BDEFFieldPath, BDEFOptions} from ".";
import {Expression, optPrio, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** field characteristics, eg. "field ( readonly, numbering : managed ) ID, CreatedBy;" */
export class BDEFField extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("FIELD", BDEFOptions, BDEFFieldPath, starPrio(seq(",", BDEFFieldPath)), optPrio(","), ";");
  }
}
