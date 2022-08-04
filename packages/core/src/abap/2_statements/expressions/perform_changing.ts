import {Expression, seq, plus} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Target} from "./target";

export class PerformChanging extends Expression {
  public getRunnable(): IStatementRunnable {
    const changing = seq("CHANGING", plus(Target));

    return changing;
  }
}