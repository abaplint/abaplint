import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class DeleteTextpool extends Statement {

  public static get_matcher(): IRunnable {
    let language = seq(str("LANGUAGE"), new Reuse.Source());
    let state = seq(str("STATE"), new Reuse.Source());

    return seq(str("DELETE TEXTPOOL"),
               new Reuse.Source(),
               opt(language),
               opt(state));
  }

}