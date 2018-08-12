import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";
import {Version} from "../version";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let ver = Combi.ver;

export class Wait extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let up = seq(str("UP TO"), new Reuse.Source(), str("SECONDS"));

    let type = seq(str("FOR"), alt(str("MESSAGING"), ver(Version.v750, str("PUSH"))), str("CHANNELS"));

    let until = seq(opt(type), str("UNTIL"), new Reuse.Cond(), opt(up));

    return seq(str("WAIT"), alt(until, up));
  }

}