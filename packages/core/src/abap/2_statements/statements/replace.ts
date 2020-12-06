import {IStatement} from "./_statement";
import {seq, alt, opt, per} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Replace implements IStatement {

  public getMatcher(): IStatementRunnable {
    const length = seq("LENGTH", Source);
    const offset = seq("OFFSET", Source);

    const section = seq(opt("IN"),
                        "SECTION",
                        per(offset, length),
                        "OF",
                        Source);

    const source = seq(opt("OF"),
                       opt(alt("REGEX", "SUBSTRING")),
                       Source);

    const cas = alt("IGNORING CASE", "RESPECTING CASE");

    const repl = seq("REPLACEMENT COUNT", Target);
    const replo = seq("REPLACEMENT OFFSET", Target);
    const repll = seq("REPLACEMENT LENGTH", Target);
    const repli = seq("REPLACEMENT LINE", Target);

    const occ = alt("ALL OCCURRENCES",
                    "ALL OCCURENCES",
                    "FIRST OCCURENCE",
                    "FIRST OCCURRENCE");

    const mode = alt("IN CHARACTER MODE",
                     "IN BYTE MODE");

    const wit = seq("WITH", Source);
    const into = seq("INTO", Target);

    return seq("REPLACE",
               per(section, seq(opt(occ), source)),
               opt(seq("IN", opt("TABLE"), Target)),
               opt(per(wit, into, cas, mode, repl, replo, repll, repli, length)));
  }

}