import {IStatement} from "./_statement";
import {seq, alt, altPrio, optPrio, ver, AlsoIn} from "../combi";
import {Release} from "../../../version";
import {FSTarget, Target, Field, Source, SimpleSource4} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Append implements IStatement {

  public getMatcher(): IStatementRunnable {
    const assigning = seq("ASSIGNING", FSTarget, optPrio("CASTING"));
    const reference = seq("REFERENCE INTO", Target);
    const sorted = seq("SORTED BY", Field);
    const result = altPrio(assigning, reference);
    const additions = optPrio(altPrio(seq(sorted, optPrio(result)), seq(result, optPrio(sorted))));

    const fromIndex = seq("FROM", Source);
    const toIndex = seq("TO", Source);
    const toTarget = seq("TO", Target);

    const src = alt(SimpleSource4, ver(Release.v740sp02, Source, {also: AlsoIn.OpenABAP}));

    return seq("APPEND", altPrio(
      seq("INITIAL LINE", toTarget, optPrio(result)),
      seq("LINES OF", src, optPrio(fromIndex), altPrio(seq(toIndex, toTarget), toTarget)),
      seq(src, optPrio(toTarget), additions)));
  }

}
