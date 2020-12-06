import {Expression, seqs, pluss} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Source} from "./source";

export class PerformChanging extends Expression {
  public getRunnable(): IStatementRunnable {
    const changing = seqs("CHANGING", pluss(Source));

    return changing;
  }
}