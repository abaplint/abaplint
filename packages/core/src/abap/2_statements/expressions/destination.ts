import {seq, opt, Expression, altPrio} from "../combi";
import {Source} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Destination extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("DESTINATION", opt("IN GROUP"), altPrio("DEFAULT", Source));
  }
}