import {IStatement} from "./_statement";
import {str, seqs, alt, opt, per} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Replace implements IStatement {

  public getMatcher(): IStatementRunnable {
    const length = seqs("LENGTH", Source);
    const offset = seqs("OFFSET", Source);

    const section = seqs(opt(str("IN")),
                         "SECTION",
                         per(offset, length),
                         "OF",
                         Source);

    const source = seqs(opt(str("OF")),
                        opt(alt(str("REGEX"), str("SUBSTRING"))),
                        Source);

    const cas = alt(str("IGNORING CASE"),
                    str("RESPECTING CASE"));

    const repl = seqs("REPLACEMENT COUNT", Target);
    const replo = seqs("REPLACEMENT OFFSET", Target);
    const repll = seqs("REPLACEMENT LENGTH", Target);
    const repli = seqs("REPLACEMENT LINE", Target);

    const occ = alt(str("ALL OCCURRENCES"),
                    str("ALL OCCURENCES"),
                    str("FIRST OCCURENCE"),
                    str("FIRST OCCURRENCE"));

    const mode = alt(str("IN CHARACTER MODE"),
                     str("IN BYTE MODE"));

    const wit = seqs("WITH", Source);
    const into = seqs("INTO", Target);

    return seqs("REPLACE",
                per(section, seqs(opt(occ), source)),
                opt(seqs("IN", opt(str("TABLE")), Target)),
                opt(per(wit, into, cas, mode, repl, replo, repll, repli, length)));
  }

}