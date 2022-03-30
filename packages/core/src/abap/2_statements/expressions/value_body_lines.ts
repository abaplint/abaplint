import {seq, Expression, optPrio} from "../combi";
import {Source} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ValueBodyLines extends Expression {
  public getRunnable(): IStatementRunnable {
    const range = seq(optPrio(seq("FROM", Source)), optPrio(seq("TO", Source)));
    const lines = seq("LINES OF", Source, range);
    return lines;
  }
}