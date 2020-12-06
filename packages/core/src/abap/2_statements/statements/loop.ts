import {IStatement} from "./_statement";
import {str, seqs, alts, opt, ver, altPrios, optPrio, tok, per, plus} from "../combi";
import {FSTarget, Target, ComponentCond, Dynamic, Source, ComponentCompare, SimpleName, ComponentName} from "../expressions";
import {Version} from "../../../version";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {BasicSource} from "../expressions/basic_source";

export class Loop implements IStatement {

  public getMatcher(): IStatementRunnable {
    const where = seqs("WHERE", alts(ComponentCond, Dynamic));

    const groupSize = seqs(ComponentName, "=", "GROUP SIZE");

    const components = seqs(tok(WParenLeftW), plus(alts(ComponentCompare, groupSize)), tok(WParenRightW));

    const into = seqs(opt(str("REFERENCE")), "INTO", Target);

    const assigning = seqs("ASSIGNING", FSTarget);

    const group = ver(Version.v740sp08,
                      seqs("GROUP BY",
                           alts(Source, components),
                           optPrio(str("ASCENDING")),
                           optPrio(str("WITHOUT MEMBERS")),
                           optPrio(alts(into, assigning))));

    const target = alts(seqs(alts(into, assigning),
                             optPrio(str("CASTING"))),
                        "TRANSPORTING NO FIELDS");

    const from = seqs("FROM", Source);

    const to = seqs("TO", Source);

    const usingKey = seqs("USING KEY", altPrios(SimpleName, Dynamic));

    const options = per(target, from, to, where, usingKey, group);

    const at = seqs("AT",
                    opt(ver(Version.v740sp08, str("GROUP"))),
                    alts(BasicSource, ver(Version.v740sp02, new Source())),
                    opt(options));

    return seqs("LOOP", opt(at));
  }

}