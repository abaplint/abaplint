import {IStatement} from "./_statement";
import {str, seqs, opts, alts, per, plus, optPrios} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Find implements IStatement {

  public getMatcher(): IStatementRunnable {
    const options = per(str("IGNORING CASE"),
                        str("RESPECTING CASE"),
                        str("IN BYTE MODE"),
                        str("IN CHARACTER MODE"),
                        seqs("OF", Source),
                        seqs("FROM", Source),
                        seqs("TO", Source),
                        seqs("MATCH OFFSET", Target),
                        seqs("MATCH LINE", Target),
                        seqs("MATCH COUNT", Target),
                        seqs("MATCH LENGTH", Target),
                        seqs("LENGTH", Source),
                        seqs("RESULTS", Target),
                        seqs("SUBMATCHES", plus(new Target())));

    const sectionLength = seqs("SECTION LENGTH", Source, "OF");

    const before = seqs(optPrios(alts("TABLE", "SECTION OFFSET", sectionLength)),
                        Source);

    const ret = seqs("FIND",
                     opts(alts("FIRST OCCURRENCE OF", "ALL OCCURRENCES OF")),
                     opts(alts("REGEX", "SUBSTRING")),
                     Source,
                     "IN",
                     before,
                     opts(options));

    return ret;
  }

}