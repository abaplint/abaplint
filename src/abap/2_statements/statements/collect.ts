import {Statement} from "./_statement";
import {str, seq, opt, IStatementRunnable} from "../combi";
import {Target, Source, FSTarget} from "../expressions";

export class Collect extends Statement {

  public getMatcher(): IStatementRunnable {
    const into = seq(str("INTO"), new Target());
    const assigning = seq(str("ASSIGNING"), new FSTarget());

    return seq(str("COLLECT"),
               new Source(),
               opt(into),
               opt(assigning));
  }

}