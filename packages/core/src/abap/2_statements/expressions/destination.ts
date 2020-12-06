import {seqs, str, opt, Expression, altPrios} from "../combi";
import {Source} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Destination extends Expression {
  public getRunnable(): IStatementRunnable {
    return seqs("DESTINATION", opt(str("IN GROUP")), altPrios("DEFAULT", Source));
  }
}