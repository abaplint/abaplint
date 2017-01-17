import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;
let per = Combi.per;

export class Shift extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let deleting = seq(str("DELETING"), alt(str("LEADING"), str("TRAILING")), new Reuse.Source());
    let up = seq(str("UP TO"), new Reuse.Source());
    let mode = seq(str("IN"), alt(str("CHARACTER"), str("BYTE")), str("MODE"));
    let dir = alt(str("LEFT"), str("RIGHT"));
    let by = seq(str("BY"), new Reuse.Source(), opt(str("PLACES")));

    let options = per(deleting, up, mode, dir, by, str("CIRCULAR"));

    return seq(str("SHIFT"),
               new Reuse.Target(),
               opt(options));
  }

}