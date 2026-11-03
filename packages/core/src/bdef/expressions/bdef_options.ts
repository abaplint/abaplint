import {BDEFName} from ".";
import {altPrio, Expression, optPrio, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** eg. "( features : instance, precheck )", "( read only )" or "( hierarchy-index )" */
export class BDEFOptions extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(BDEFName, starPrio(altPrio(seq("-", BDEFName), BDEFName)));
    const option = seq(name, optPrio(seq(":", BDEFName)));
    return seq("(", option, starPrio(seq(",", option)), ")");
  }
}
