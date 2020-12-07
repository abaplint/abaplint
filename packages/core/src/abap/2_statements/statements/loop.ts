import {IStatement} from "./_statement";
import {seq, alt, opt, ver, altPrio, optPrio, tok, per, plus} from "../combi";
import {FSTarget, Target, ComponentCond, Dynamic, Source, ComponentCompare, SimpleName, ComponentName} from "../expressions";
import {Version} from "../../../version";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {BasicSource} from "../expressions/basic_source";

export class Loop implements IStatement {

  public getMatcher(): IStatementRunnable {
    const where = seq("WHERE", alt(ComponentCond, Dynamic));

    const groupSize = seq(ComponentName, "=", "GROUP SIZE");

    const components = seq(tok(WParenLeftW), plus(alt(ComponentCompare, groupSize)), tok(WParenRightW));

    const into = seq(opt("REFERENCE"), "INTO", Target);

    const assigning = seq("ASSIGNING", FSTarget);

    const group = ver(Version.v740sp08,
                      seq("GROUP BY",
                          alt(Source, components),
                          optPrio("ASCENDING"),
                          optPrio("WITHOUT MEMBERS"),
                          optPrio(alt(into, assigning))));

    const target = alt(seq(alt(into, assigning),
                           optPrio("CASTING")),
                       "TRANSPORTING NO FIELDS");

    const from = seq("FROM", Source);

    const to = seq("TO", Source);

    const usingKey = seq("USING KEY", altPrio(SimpleName, Dynamic));

    const options = per(target, from, to, where, usingKey, group);

    const at = seq("AT",
                   opt(ver(Version.v740sp08, "GROUP")),
                   alt(BasicSource, ver(Version.v740sp02, Source)),
                   opt(options));

    return seq("LOOP", opt(at));
  }

}