import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, IRunnable} from "../combi";

export class CallSelectionScreen extends Statement {

  public static get_matcher(): IRunnable {
    let ending = seq(str("ENDING AT"), new Reuse.Source(), new Reuse.Source());
    let starting = seq(str("STARTING AT"), new Reuse.Source(), new Reuse.Source());
    let using = seq(str("USING SELECTION-SET"), new Reuse.Source());

    let at = seq(starting, opt(ending));

    let call = seq(str("CALL SELECTION-SCREEN"), new Reuse.Source(), opt(at), opt(using));

    return call;
  }

}