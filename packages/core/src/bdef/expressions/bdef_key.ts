import {BDEFName} from ".";
import {Expression, optPrio, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** alternative key, eg. "define pure key AlternativeKey { id; }" */
export class BDEFKey extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = seq(BDEFName, starPrio(seq(",", BDEFName)), ";");
    return seq("DEFINE", optPrio("PURE"), "KEY", BDEFName, "{", starPrio(fields), "}");
  }
}
