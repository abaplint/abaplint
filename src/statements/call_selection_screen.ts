import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class CallSelectionScreen extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ending = seq(str("ENDING AT"), new Reuse.Source(), new Reuse.Source());
    let starting = seq(str("STARTING AT"), new Reuse.Source(), new Reuse.Source());
    let using = seq(str("USING SELECTION-SET"), new Reuse.Source());

    let at = seq(starting, opt(ending));

    let call = seq(str("CALL SELECTION-SCREEN"), new Reuse.Source(), opt(at), opt(using));

    return call;
  }

}