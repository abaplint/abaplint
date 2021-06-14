import {seq, Expression, optPrio} from "../combi";
import {Source, Let} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ConvBody extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(optPrio(Let), Source);
  }
}