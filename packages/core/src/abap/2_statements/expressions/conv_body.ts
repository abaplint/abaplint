import {seq, Expression, opts} from "../combi";
import {Source, Let} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ConvBody extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(opts(Let), Source);
  }
}