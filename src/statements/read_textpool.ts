import {Statement} from "./statement";
import {str, seq, per, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class ReadTextpool extends Statement {

  public static get_matcher(): IRunnable {
    let language = seq(str("LANGUAGE"), new Reuse.Source());
    let into = seq(str("INTO"), new Reuse.Target());
    let state = seq(str("STATE"), new Reuse.Source());

    return seq(str("READ TEXTPOOL"),
               new Reuse.Source(),
               per(into, language, state));
  }

}