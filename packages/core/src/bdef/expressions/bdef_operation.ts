import {BDEFDefaultFunction, BDEFOptions} from ".";
import {altPrio, Expression, optPrio, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** standard operations, eg. "internal create ( features : global );" */
export class BDEFOperation extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(
      starPrio(altPrio("INTERNAL", "STATIC")),
      altPrio("CREATE", "UPDATE", "DELETE"),
      optPrio(BDEFOptions),
      altPrio(";", BDEFDefaultFunction));
  }
}
