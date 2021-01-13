import {IStatement} from "./_statement";
import {opt, seq, alt, altPrio, optPrio, ver} from "../combi";
import {Version} from "../../../version";
import {FSTarget, Target, Field, Source, SimpleSource4} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Append implements IStatement {

  public getMatcher(): IStatementRunnable {
    const assigning = seq("ASSIGNING", FSTarget);
    const reference = seq("REFERENCE INTO", Target);
    const sorted = seq("SORTED BY", Field);

    const range = seq(optPrio(seq("FROM", Source)),
                      optPrio(seq("TO", Source)));

    const src = alt(SimpleSource4, ver(Version.v740sp02, Source));

    return seq("APPEND",
               altPrio("INITIAL LINE", seq(optPrio("LINES OF"), src)),
               opt(range),
               optPrio(seq("TO", Target)),
               opt(altPrio(assigning, reference)),
               optPrio("CASTING"),
               optPrio(sorted));
  }

}