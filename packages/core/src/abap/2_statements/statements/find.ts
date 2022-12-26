import {IStatement} from "./_statement";
import {seq, opt, per, plus, optPrio, altPrio} from "../combi";
import {Target, Source, FindType} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Find implements IStatement {

  public getMatcher(): IStatementRunnable {
// SUBMATCHES handling is a workaround
    const options = per("IGNORING CASE",
                        "RESPECTING CASE",
                        "IN BYTE MODE",
                        "IN CHARACTER MODE",
                        seq("OF", Source),
                        seq("FROM", Source),
                        seq("TO", Source),
                        seq("MATCH OFFSET", Target),
                        seq("MATCH LINE", Target),
                        seq("MATCH COUNT", Target),
                        seq("MATCH LENGTH", Target),
                        seq("LENGTH", Source),
                        seq("RESULTS", Target),
                        seq("SUBMATCHES", Target),
                        seq("SUBMATCHES", Target, Target),
                        seq("SUBMATCHES", plus(Target)));

    const sectionLength = seq("SECTION LENGTH", Source, "OF");

    const before = seq(optPrio(altPrio("TABLE", "SECTION OFFSET", sectionLength)),
                       Source);

    const ret = seq("FIND",
                    opt(altPrio("FIRST OCCURRENCE OF", "ALL OCCURRENCES OF")),
                    FindType,
                    Source,
                    "IN",
                    before,
                    opt(options));

    return ret;
  }

}