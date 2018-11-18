import {Statement} from "./_statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Collect extends Statement {

  public getMatcher(): IRunnable {
    const into = seq(str("INTO"), new Target());

    return seq(str("COLLECT"),
               new Source(),
               opt(into));
  }

}