import {IStatement} from "./_statement";
import {str, seq, opt} from "../combi";
import {Target, Source, FSTarget} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Collect implements IStatement {

  public getMatcher(): IStatementRunnable {
    const into = seq(str("INTO"), new Target());
    const assigning = seq(str("ASSIGNING"), new FSTarget());

    return seq(str("COLLECT"),
               new Source(),
               opt(into),
               opt(assigning));
  }

}