import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let per = Combi.per;

export class Convert extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let intoTime = seq(str("TIME"), new Reuse.Target());
    let intoDate = seq(str("DATE"), new Reuse.Target());
    let into = seq(str("INTO"), per(intoTime, intoDate));

    let daylight = seq(str("DAYLIGHT SAVING TIME"), new Reuse.Source());
    let zone = seq(str("TIME ZONE"), new Reuse.Source());

    let time = seq(str("TIME STAMP"),
                   new Reuse.Source(),
                   per(zone, into, daylight));

    let dat = seq(str("DATE"), new Reuse.Source());
    let tim = seq(str("TIME"), new Reuse.Source());

    let stamp = seq(str("INTO TIME STAMP"), new Reuse.Target());
    let invert = seq(str("INTO INVERTED-DATE"), new Reuse.Target());

    let date = seq(per(dat, tim),
                   per(daylight, stamp, zone, invert));

    let inv = seq(str("INVERTED-DATE"), new Reuse.Source(), str("INTO DATE"), new Reuse.Target());

    return seq(str("CONVERT"), alt(time, date, inv));
  }

}