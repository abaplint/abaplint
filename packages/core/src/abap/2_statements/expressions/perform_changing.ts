import {Expression, seq, pluss} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Source} from "./source";

export class PerformChanging extends Expression {
  public getRunnable(): IStatementRunnable {
    const changing = seq("CHANGING", pluss(Source));

    return changing;
  }
}