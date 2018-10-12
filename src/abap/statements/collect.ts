import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Collect extends Statement {

  public get_matcher(): IRunnable {
    let into = seq(str("INTO"), new Target());

    return seq(str("COLLECT"),
               new Source(),
               opt(into));
  }

}