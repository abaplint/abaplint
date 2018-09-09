import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, IRunnable} from "../combi";

export class CallScreen extends Statement {

  public static get_matcher(): IRunnable {
    let starting = seq(str("STARTING AT"), new Reuse.Source(), new Reuse.Source());
    let ending = seq(str("ENDING AT"), new Reuse.Source(), new Reuse.Source());

    let call = seq(str("CALL SCREEN"), new Reuse.Source(), opt(seq(starting, opt(ending))));

    return call;
  }

}