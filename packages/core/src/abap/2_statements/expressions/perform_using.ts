import {Expression, seqs, plus} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Source} from "./source";

export class PerformUsing extends Expression {
  public getRunnable(): IStatementRunnable {
    const using = seqs("USING", plus(new Source()));

    return using;
  }
}