import {seqs, Expression} from "../combi";
import {Integer} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Decimals extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seqs("DECIMALS", Integer);
    return ret;
  }
}