import {IStatement} from "./_statement";
import {seq, alt, opt, ver, altPrio, per, failCombinator} from "../combi";
import {ComponentCond, Dynamic, Source, SimpleName, LoopTarget} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SimpleSource2} from "../expressions/simple_source2";
import {LoopGroupBy} from "../expressions/loop_group_by";

export class Loop implements IStatement {

  public getMatcher(): IStatementRunnable {
    const where = seq("WHERE", alt(ComponentCond, Dynamic));

    const group = ver(Version.v740sp08, seq("GROUP BY", LoopGroupBy));

    const from = seq("FROM", Source);

    const to = seq("TO", Source);

    const usingKey = seq("USING KEY", altPrio(SimpleName, Dynamic));

    const options = per(LoopTarget, from, to, where, usingKey, group);

    const at = seq("AT",
                   opt(seq("SCREEN", failCombinator())),
                   opt(ver(Version.v740sp08, "GROUP")),
                   alt(SimpleSource2, ver(Version.v740sp02, Source)),
                   opt(options));

    return seq("LOOP", opt(at));
  }

}