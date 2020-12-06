import {Expression, seqs, pers, optPrios} from "../combi";
import {Source, SimpleName, ComponentCond} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FilterBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const inn = seqs("IN", Source);
    const using = seqs("USING KEY", SimpleName);
    return seqs(
      Source,
      optPrios("EXCEPT"),
      optPrios(pers(inn, using)),
      seqs("WHERE", ComponentCond));
  }
}