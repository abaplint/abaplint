import {IStatement} from "./_statement";
import {seq, opt, alt, pers, pluss, optPrios} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Find implements IStatement {

  public getMatcher(): IStatementRunnable {
    const options = pers("IGNORING CASE",
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
                         seq("SUBMATCHES", pluss(Target)));

    const sectionLength = seq("SECTION LENGTH", Source, "OF");

    const before = seq(optPrios(alt("TABLE", "SECTION OFFSET", sectionLength)),
                       Source);

    const ret = seq("FIND",
                    opt(alt("FIRST OCCURRENCE OF", "ALL OCCURRENCES OF")),
                    opt(alt("REGEX", "SUBSTRING")),
                    Source,
                    "IN",
                    before,
                    opt(options));

    return ret;
  }

}