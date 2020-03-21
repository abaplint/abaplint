import {Statement} from "./_statement";
import {str, opt, alt, seq, ver, IStatementRunnable} from "../combi";
import {Version} from "../../../version";
import {FSTarget, Target, Field, Source, SimpleSource} from "../expressions";

export class Append extends Statement {

  public getMatcher(): IStatementRunnable {
    const assigning = seq(str("ASSIGNING"), new FSTarget());
    const reference = seq(str("REFERENCE INTO"), new Target());
    const sorted = seq(str("SORTED BY"), new Field());

    const range = seq(opt(seq(str("FROM"), new Source())),
                      opt(seq(str("TO"), new Source())));

    const src = alt(ver(Version.v740sp02, new Source()), new SimpleSource());

    return seq(str("APPEND"),
               alt(str("INITIAL LINE"), seq(opt(str("LINES OF")), src)),
               opt(range),
               opt(seq(str("TO"), new Target())),
               opt(alt(assigning, reference)),
               opt(str("CASTING")),
               opt(sorted));
  }

}