import {altPrio, Expression, optPrio, regex, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** eg. "[1]" or "[0..*]" */
export class BDEFCardinality extends Expression {
  public getRunnable(): IStatementRunnable {
    const integer = regex(/^\d+$/);
    return seq("[", integer, optPrio(seq(".", ".", altPrio(integer, "*"))), "]");
  }
}
