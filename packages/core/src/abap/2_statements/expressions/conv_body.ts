import {seqs, Expression, opts} from "../combi";
import {Source, Let} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ConvBody extends Expression {
  public getRunnable(): IStatementRunnable {
    return seqs(opts(Let), Source);
  }
}