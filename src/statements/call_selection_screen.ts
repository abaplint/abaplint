import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Source} from "../expressions";

export class CallSelectionScreen extends Statement {

  public static get_matcher(): IRunnable {
    let ending = seq(str("ENDING AT"), new Source(), new Source());
    let starting = seq(str("STARTING AT"), new Source(), new Source());
    let using = seq(str("USING SELECTION-SET"), new Source());

    let at = seq(starting, opt(ending));

    let call = seq(str("CALL SELECTION-SCREEN"), new Source(), opt(at), opt(using));

    return call;
  }

}