import {Statement} from "./_statement";
import {str, seq, alt, per, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Convert extends Statement {

  public getMatcher(): IStatementRunnable {
    const intoTime = seq(str("TIME"), new Target());
    const intoDate = seq(str("DATE"), new Target());
    const into = seq(str("INTO"), per(intoTime, intoDate));

    const daylight = seq(str("DAYLIGHT SAVING TIME"), new Source());
    const zone = seq(str("TIME ZONE"), new Source());

    const time = seq(str("TIME STAMP"),
                     new Source(),
                     per(zone, into, daylight));

    const dat = seq(str("DATE"), new Source());
    const tim = seq(str("TIME"), new Source());

    const stamp = seq(str("INTO TIME STAMP"), new Target());
    const invert = seq(str("INTO INVERTED-DATE"), new Target());

    const date = seq(per(dat, tim),
                     per(daylight, stamp, zone, invert));

    const inv = seq(str("INVERTED-DATE"), new Source(), str("INTO DATE"), new Target());

    return seq(str("CONVERT"), alt(time, date, inv));
  }

}