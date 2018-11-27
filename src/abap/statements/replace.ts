import {Statement} from "./_statement";
import {str, seq, alt, opt, per, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Replace extends Statement {

  public getMatcher(): IStatementRunnable {
    const length = seq(str("LENGTH"), new Source());
    const offset = seq(str("OFFSET"), new Source());

    const section = seq(opt(str("IN")),
                        str("SECTION"),
                        per(offset, length),
                        str("OF"),
                        new Source());

    const source = seq(opt(str("OF")),
                       opt(alt(str("REGEX"), str("SUBSTRING"))),
                       new Source());

    const cas = alt(str("IGNORING CASE"),
                    str("RESPECTING CASE"));

    const repl = seq(str("REPLACEMENT COUNT"), new Target());
    const replo = seq(str("REPLACEMENT OFFSET"), new Target());
    const repll = seq(str("REPLACEMENT LENGTH"), new Target());

    const occ = alt(str("ALL OCCURRENCES"),
                    str("ALL OCCURENCES"),
                    str("FIRST OCCURRENCE"));

    const mode = alt(str("IN CHARACTER MODE"),
                     str("IN BYTE MODE"));

    const wit = seq(str("WITH"), new Source());
    const into = seq(str("INTO"), new Target());

    return seq(str("REPLACE"),
               per(section, seq(opt(occ), source)),
               opt(seq(str("IN"), opt(str("TABLE")), new Target())),
               opt(per(wit, into, cas, mode, repl, replo, repll, length)));
  }

}