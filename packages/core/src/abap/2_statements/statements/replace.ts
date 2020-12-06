import {IStatement} from "./_statement";
import {seqs, alts, opts, pers} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Replace implements IStatement {

  public getMatcher(): IStatementRunnable {
    const length = seqs("LENGTH", Source);
    const offset = seqs("OFFSET", Source);

    const section = seqs(opts("IN"),
                         "SECTION",
                         pers(offset, length),
                         "OF",
                         Source);

    const source = seqs(opts("OF"),
                        opts(alts("REGEX", "SUBSTRING")),
                        Source);

    const cas = alts("IGNORING CASE", "RESPECTING CASE");

    const repl = seqs("REPLACEMENT COUNT", Target);
    const replo = seqs("REPLACEMENT OFFSET", Target);
    const repll = seqs("REPLACEMENT LENGTH", Target);
    const repli = seqs("REPLACEMENT LINE", Target);

    const occ = alts("ALL OCCURRENCES",
                     "ALL OCCURENCES",
                     "FIRST OCCURENCE",
                     "FIRST OCCURRENCE");

    const mode = alts("IN CHARACTER MODE",
                      "IN BYTE MODE");

    const wit = seqs("WITH", Source);
    const into = seqs("INTO", Target);

    return seqs("REPLACE",
                pers(section, seqs(opts(occ), source)),
                opts(seqs("IN", opts("TABLE"), Target)),
                opts(pers(wit, into, cas, mode, repl, replo, repll, repli, length)));
  }

}