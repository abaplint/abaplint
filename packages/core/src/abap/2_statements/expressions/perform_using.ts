import {Expression, seqs, pluss} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Source} from "./source";

export class PerformUsing extends Expression {
  public getRunnable(): IStatementRunnable {
    const using = seqs("USING", pluss(Source));

    return using;
  }
}