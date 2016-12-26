import {Statement} from "./statement";
import * as Reuse from "./reuse";
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
                          str("LEFT CIRCULAR BY"),
                          str("LEFT UP TO"),
                          str("LEFT BY"),
                          str("BY")),
                      new Reuse.Source(), opt(str("PLACES"))),
                  str("RIGHT"),
                  seq(opt(seq(str("UP TO"), new Reuse.Source())), str("LEFT")),
                  seq(str("BY"),
                      new Reuse.Source(),
                      str("PLACES"),
                      alt(str("LEFT"), str("RIGHT"))));

    let mode = alt(str("IN CHARACTER MODE"), str("IN BYTE MODE"));

    return seq(str("SHIFT"),
               new Reuse.Target(),
               opt(seq(dir,
                       opt(mode))));
  }

}