import {seqs, opts, Expression, altPrios} from "../combi";
import {Source} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Destination extends Expression {
  public getRunnable(): IStatementRunnable {
    return seqs("DESTINATION", opts("IN GROUP"), altPrios("DEFAULT", Source));
  }
}