import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Source} from "../expressions";

export class DeleteTextpool extends Statement {

  public static get_matcher(): IRunnable {
    let language = seq(str("LANGUAGE"), new Source());
    let state = seq(str("STATE"), new Source());

    return seq(str("DELETE TEXTPOOL"),
               new Source(),
               opt(language),
               opt(state));
  }

}