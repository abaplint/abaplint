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

    const fromIndex = seq("FROM", Source);
    const toIndex = seq("TO", Source);
    const toTarget = seq("TO", Target);

    const src = alt(SimpleSource4, ver(Version.v740sp02, Source));

    return seq("APPEND",
               altPrio("INITIAL LINE", seq(optPrio("LINES OF"), src)),
               optPrio(fromIndex),
               opt(alt(seq(toIndex, toTarget), toTarget)),
               opt(altPrio(assigning, reference)),
               optPrio("CASTING"),
               optPrio(sorted));
  }

}