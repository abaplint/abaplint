import {seq, opts, Expression, altPrio} from "../combi";
import {Source} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Destination extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("DESTINATION", opts("IN GROUP"), altPrio("DEFAULT", Source));
  }
}