import {IStatement} from "./_statement";
import {seq, alt, per, ver} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class Convert implements IStatement {

  public getMatcher(): IStatementRunnable {
    const intoTime = seq("TIME", Target);
    const intoDate = seq("DATE", Target);
    const into = seq("INTO", per(intoTime, intoDate));

    const daylight = seq("DAYLIGHT SAVING TIME", Source);
    const zone = seq("TIME ZONE", Source);

    const time = seq("TIME STAMP",
                     Source,
                     per(zone, into, daylight));

    const dat = seq("DATE", Source);
    const tim = seq("TIME", Source);

    const stamp = seq("INTO TIME STAMP", Target);
    const intoutc = ver(Version.v754, seq("INTO UTCLONG", Target));
    const invert = seq("INTO INVERTED-DATE", Target);

    const date = seq(per(dat, tim),
                     per(daylight, stamp, zone, invert, intoutc));

    const inv = seq("INVERTED-DATE", Source, "INTO DATE", Target);

    const utclong = ver(Version.v754, seq("UTCLONG", Source, per(zone, into, daylight)));

    return seq("CONVERT", alt(time, date, inv, utclong));
  }

}