import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class Shift extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let dir = alt(seq(alt(str("LEFT DELETING LEADING"),
                          str("RIGHT DELETING TRAILING"),
                          str("RIGHT BY"),
                          str("LEFT BY"),
                          str("BY")),
                      Reuse.source(), opt(str("PLACES"))),
                  str("RIGHT"),
                  str("LEFT"));

    let mode = alt(str("IN CHARACTER MODE"), str("IN BYTE MODE"));

    return seq(str("SHIFT"),
               Reuse.target(),
               opt(seq(dir,
                       opt(mode))));
  }

}