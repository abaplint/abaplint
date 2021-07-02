import {IStatement} from "./_statement";
import {seq, alt, opt, ver, altPrio, optPrio, per} from "../combi";
import {FSTarget, Target, ComponentCond, Dynamic, Source, SimpleName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SimpleSource2} from "../expressions/simple_source2";
import {LoopGroupBy} from "../expressions/loop_group_by";

export class Loop implements IStatement {

  public getMatcher(): IStatementRunnable {
    const where = seq("WHERE", alt(ComponentCond, Dynamic));

    const into = seq(opt("REFERENCE"), "INTO", Target);

    const assigning = seq("ASSIGNING", FSTarget);

    const group = ver(Version.v740sp08, seq("GROUP BY", LoopGroupBy));

    const target = alt(seq(alt(into, assigning),
                           optPrio("CASTING")),
                       "TRANSPORTING NO FIELDS");

    const from = seq("FROM", Source);

    const to = seq("TO", Source);

    const usingKey = seq("USING KEY", altPrio(SimpleName, Dynamic));

    const options = per(target, from, to, where, usingKey, group);

    const at = seq("AT",
                   opt(ver(Version.v740sp08, "GROUP")),
                   alt(SimpleSource2, ver(Version.v740sp02, Source)),
                   opt(options));

    return seq("LOOP", opt(at));
  }

}