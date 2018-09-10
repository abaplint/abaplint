import {Statement} from "./statement";
import {str, seq, alt, opt, per, IRunnable} from "../combi";
import * as Reuse from "./reuse";
import {Target} from "../expressions";

export class Replace extends Statement {

  public static get_matcher(): IRunnable {
    let length = seq(str("LENGTH"), new Reuse.Source());
    let offset = seq(str("OFFSET"), new Reuse.Source());

    let section = seq(opt(str("IN")),
                      str("SECTION"),
                      per(offset, length),
                      str("OF"),
                      new Reuse.Source());

    let source = seq(opt(str("OF")),
                     opt(alt(str("REGEX"), str("SUBSTRING"))),
                     new Reuse.Source());

    let cas = alt(str("IGNORING CASE"),
                  str("RESPECTING CASE"));

    let repl = seq(str("REPLACEMENT COUNT"), new Target());
    let replo = seq(str("REPLACEMENT OFFSET"), new Target());
    let repll = seq(str("REPLACEMENT LENGTH"), new Target());

    let leng = seq(str("LENGTH"), new Target());

    let occ = alt(str("ALL OCCURRENCES"),
                  str("ALL OCCURENCES"),
                  str("FIRST OCCURRENCE"));

    let mode = alt(str("IN CHARACTER MODE"),
                   str("IN BYTE MODE"));

    return seq(str("REPLACE"),
               per(section, seq(opt(occ), source)),
               opt(seq(str("IN"), opt(str("TABLE")), new Target())),
               per(seq(str("WITH"), new Reuse.Source()),
                   seq(str("INTO"), new Target())),
               opt(per(cas, mode, repl, replo, repll, leng)));
  }

}