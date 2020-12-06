import {IStatement} from "./_statement";
import {seq, alts, opts, vers, altPrios, optPrios, tok, pers, pluss} from "../combi";
import {FSTarget, Target, ComponentCond, Dynamic, Source, ComponentCompare, SimpleName, ComponentName} from "../expressions";
import {Version} from "../../../version";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {BasicSource} from "../expressions/basic_source";

export class Loop implements IStatement {

  public getMatcher(): IStatementRunnable {
    const where = seq("WHERE", alts(ComponentCond, Dynamic));

    const groupSize = seq(ComponentName, "=", "GROUP SIZE");

    const components = seq(tok(WParenLeftW), pluss(alts(ComponentCompare, groupSize)), tok(WParenRightW));

    const into = seq(opts("REFERENCE"), "INTO", Target);

    const assigning = seq("ASSIGNING", FSTarget);

    const group = vers(Version.v740sp08,
                       seq("GROUP BY",
                           alts(Source, components),
                           optPrios("ASCENDING"),
                           optPrios("WITHOUT MEMBERS"),
                           optPrios(alts(into, assigning))));

    const target = alts(seq(alts(into, assigning),
                            optPrios("CASTING")),
                        "TRANSPORTING NO FIELDS");

    const from = seq("FROM", Source);

    const to = seq("TO", Source);

    const usingKey = seq("USING KEY", altPrios(SimpleName, Dynamic));

    const options = pers(target, from, to, where, usingKey, group);

    const at = seq("AT",
                   opts(vers(Version.v740sp08, "GROUP")),
                   alts(BasicSource, vers(Version.v740sp02, Source)),
                   opts(options));

    return seq("LOOP", opts(at));
  }

}