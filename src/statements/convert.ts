import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, alt, per, IRunnable} from "../combi";
import {Target} from "../expressions";

export class Convert extends Statement {

  public static get_matcher(): IRunnable {
    let intoTime = seq(str("TIME"), new Target());
    let intoDate = seq(str("DATE"), new Target());
    let into = seq(str("INTO"), per(intoTime, intoDate));

    let daylight = seq(str("DAYLIGHT SAVING TIME"), new Reuse.Source());
    let zone = seq(str("TIME ZONE"), new Reuse.Source());

    let time = seq(str("TIME STAMP"),
                   new Reuse.Source(),
                   per(zone, into, daylight));

    let dat = seq(str("DATE"), new Reuse.Source());
    let tim = seq(str("TIME"), new Reuse.Source());

    let stamp = seq(str("INTO TIME STAMP"), new Target());
    let invert = seq(str("INTO INVERTED-DATE"), new Target());

    let date = seq(per(dat, tim),
                   per(daylight, stamp, zone, invert));

    let inv = seq(str("INVERTED-DATE"), new Reuse.Source(), str("INTO DATE"), new Target());

    return seq(str("CONVERT"), alt(time, date, inv));
  }

}