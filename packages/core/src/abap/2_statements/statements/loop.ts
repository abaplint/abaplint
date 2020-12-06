import {IStatement} from "./_statement";
import {seqs, alts, opts, vers, altPrios, optPrios, tok, pers, pluss} from "../combi";
import {FSTarget, Target, ComponentCond, Dynamic, Source, ComponentCompare, SimpleName, ComponentName} from "../expressions";
import {Version} from "../../../version";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {BasicSource} from "../expressions/basic_source";

export class Loop implements IStatement {

  public getMatcher(): IStatementRunnable {
    const where = seqs("WHERE", alts(ComponentCond, Dynamic));

    const groupSize = seqs(ComponentName, "=", "GROUP SIZE");

    const components = seqs(tok(WParenLeftW), pluss(alts(ComponentCompare, groupSize)), tok(WParenRightW));

    const into = seqs(opts("REFERENCE"), "INTO", Target);

    const assigning = seqs("ASSIGNING", FSTarget);

    const group = vers(Version.v740sp08,
                       seqs("GROUP BY",
                            alts(Source, components),
                            optPrios("ASCENDING"),
                            optPrios("WITHOUT MEMBERS"),
                            optPrios(alts(into, assigning))));

    const target = alts(seqs(alts(into, assigning),
                             optPrios("CASTING")),
                        "TRANSPORTING NO FIELDS");

    const from = seqs("FROM", Source);

    const to = seqs("TO", Source);

    const usingKey = seqs("USING KEY", altPrios(SimpleName, Dynamic));

    const options = pers(target, from, to, where, usingKey, group);

    const at = seqs("AT",
                    opts(vers(Version.v740sp08, "GROUP")),
                    alts(BasicSource, vers(Version.v740sp02, Source)),
                    opts(options));

    return seqs("LOOP", opts(at));
  }

}