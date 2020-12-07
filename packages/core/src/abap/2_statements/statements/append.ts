import {IStatement} from "./_statement";
import {opt, alt, seq, altPrio, optPrio, ver} from "../combi";
import {Version} from "../../../version";
import {FSTarget, Target, Field, Source, SimpleSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Append implements IStatement {

  public getMatcher(): IStatementRunnable {
    const assigning = seq("ASSIGNING", FSTarget);
    const reference = seq("REFERENCE INTO", Target);
    const sorted = seq("SORTED BY", Field);

    const range = seq(optPrio(seq("FROM", Source)),
                      optPrio(seq("TO", Source)));

    const src = alt(ver(Version.v740sp02, Source), SimpleSource);

    return seq("APPEND",
               altPrio("INITIAL LINE", seq(optPrio("LINES OF"), src)),
               opt(range),
               optPrio(seq("TO", Target)),
               opt(altPrio(assigning, reference)),
               optPrio("CASTING"),
               optPrio(sorted));
  }

}