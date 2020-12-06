import {IStatement} from "./_statement";
import {opts, alt, seq, altPrios, optPrios, vers} from "../combi";
import {Version} from "../../../version";
import {FSTarget, Target, Field, Source, SimpleSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Append implements IStatement {

  public getMatcher(): IStatementRunnable {
    const assigning = seq("ASSIGNING", FSTarget);
    const reference = seq("REFERENCE INTO", Target);
    const sorted = seq("SORTED BY", Field);

    const range = seq(optPrios(seq("FROM", Source)),
                      optPrios(seq("TO", Source)));

    const src = alt(vers(Version.v740sp02, Source), SimpleSource);

    return seq("APPEND",
               altPrios("INITIAL LINE", seq(optPrios("LINES OF"), src)),
               opts(range),
               optPrios(seq("TO", Target)),
               opts(altPrios(assigning, reference)),
               optPrios("CASTING"),
               optPrios(sorted));
  }

}