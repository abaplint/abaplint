import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class CallScreen extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let starting = seq(str("STARTING AT"), new Reuse.Source(), new Reuse.Source());
    let ending = seq(str("ENDING AT"), new Reuse.Source(), new Reuse.Source());

    let call = seq(str("CALL SCREEN"), new Reuse.Source(), opt(seq(starting, opt(ending))));

    return call;
  }

}