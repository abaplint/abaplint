import {Statement} from "./_statement";
import {str, seq, opt, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Collect extends Statement {

  public getMatcher(): IStatementRunnable {
    const into = seq(str("INTO"), new Target());

    return seq(str("COLLECT"),
               new Source(),
               opt(into));
  }

}