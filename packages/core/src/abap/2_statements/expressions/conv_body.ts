import {seqs, Expression, opt} from "../combi";
import {Source, Let} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ConvBody extends Expression {
  public getRunnable(): IStatementRunnable {
    return seqs(opt(new Let()), Source);
  }
}