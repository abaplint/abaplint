import {Statement} from "./statement";
import {str, seq, per, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class ReadTextpool extends Statement {

  public static get_matcher(): IRunnable {
    let language = seq(str("LANGUAGE"), new Source());
    let into = seq(str("INTO"), new Target());
    let state = seq(str("STATE"), new Source());

    return seq(str("READ TEXTPOOL"),
               new Source(),
               per(into, language, state));
  }

}