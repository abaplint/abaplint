import {IStatement} from "./_statement";
import {seqs, alt, per} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Convert implements IStatement {

  public getMatcher(): IStatementRunnable {
    const intoTime = seqs("TIME", Target);
    const intoDate = seqs("DATE", Target);
    const into = seqs("INTO", per(intoTime, intoDate));

    const daylight = seqs("DAYLIGHT SAVING TIME", Source);
    const zone = seqs("TIME ZONE", Source);

    const time = seqs("TIME STAMP",
                      Source,
                      per(zone, into, daylight));

    const dat = seqs("DATE", Source);
    const tim = seqs("TIME", Source);

    const stamp = seqs("INTO TIME STAMP", Target);
    const invert = seqs("INTO INVERTED-DATE", Target);

    const date = seqs(per(dat, tim),
                      per(daylight, stamp, zone, invert));

    const inv = seqs("INVERTED-DATE", Source, "INTO DATE", Target);

    return seqs("CONVERT", alt(time, date, inv));
  }

}