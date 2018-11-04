import {Statement} from "./_statement";
import {str, seq, alt, opt, per, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Replace extends Statement {

  public getMatcher(): IRunnable {
    let length = seq(str("LENGTH"), new Source());
    let offset = seq(str("OFFSET"), new Source());

    let section = seq(opt(str("IN")),
                      str("SECTION"),
                      per(offset, length),
                      str("OF"),
                      new Source());

    let source = seq(opt(str("OF")),
                     opt(alt(str("REGEX"), str("SUBSTRING"))),
                     new Source());

    let cas = alt(str("IGNORING CASE"),
                  str("RESPECTING CASE"));

    let repl = seq(str("REPLACEMENT COUNT"), new Target());
    let replo = seq(str("REPLACEMENT OFFSET"), new Target());
    let repll = seq(str("REPLACEMENT LENGTH"), new Target());

    let occ = alt(str("ALL OCCURRENCES"),
                  str("ALL OCCURENCES"),
                  str("FIRST OCCURRENCE"));

    let mode = alt(str("IN CHARACTER MODE"),
                   str("IN BYTE MODE"));

    let wit = seq(str("WITH"), new Source());
    let into = seq(str("INTO"), new Target());

    return seq(str("REPLACE"),
               per(section, seq(opt(occ), source)),
               opt(seq(str("IN"), opt(str("TABLE")), new Target())),
               opt(per(wit, into, cas, mode, repl, replo, repll, length)));
  }

}