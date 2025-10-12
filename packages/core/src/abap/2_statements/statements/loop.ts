import {IStatement} from "./_statement";
import {seq, alt, opt, ver, altPrio, per, failCombinator} from "../combi";
import {ComponentCond, Dynamic, Source, SimpleName, LoopTarget, LoopSource} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {LoopGroupBy} from "../expressions/loop_group_by";

export class Loop implements IStatement {

  public getMatcher(): IStatementRunnable {
    const where = seq("WHERE", alt(ComponentCond, Dynamic));

    const group = ver(Version.v740sp08, seq("GROUP BY", LoopGroupBy), Version.OpenABAP);

    const step = ver(Version.v757, seq("STEP", Source));

    const from = seq("FROM", Source);

    const to = seq("TO", Source);

    const usingKey = seq("USING KEY", altPrio(SimpleName, Dynamic));

    const options = per(LoopTarget, from, to, where, usingKey, group, step);

    const at = seq(opt(seq("SCREEN", failCombinator())),
                   opt(ver(Version.v740sp08, "GROUP", Version.OpenABAP)),
                   LoopSource,
                   opt(options));

    return seq("LOOP AT", at);
  }

}