import {seq, Expression, altPrio, optPrio} from "../combi";
import {Source} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Destination extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("DESTINATION", optPrio("IN GROUP"), altPrio("DEFAULT", Source));
  }
}