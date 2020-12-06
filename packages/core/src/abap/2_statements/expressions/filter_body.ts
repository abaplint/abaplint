import {Expression, seq, pers, optPrios} from "../combi";
import {Source, SimpleName, ComponentCond} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FilterBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const inn = seq("IN", Source);
    const using = seq("USING KEY", SimpleName);
    return seq(
      Source,
      optPrios("EXCEPT"),
      optPrios(pers(inn, using)),
      seq("WHERE", ComponentCond));
  }
}