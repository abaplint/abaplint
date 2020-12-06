import {IStatement} from "./_statement";
import {str, seqs, alt, opt, ver, altPrio, optPrio, tok, per, plus} from "../combi";
import {FSTarget, Target, ComponentCond, Dynamic, Source, ComponentCompare, SimpleName, ComponentName} from "../expressions";
import {Version} from "../../../version";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {BasicSource} from "../expressions/basic_source";

export class Loop implements IStatement {

  public getMatcher(): IStatementRunnable {
    const where = seqs("WHERE", alt(new ComponentCond(), new Dynamic()));

    const groupSize = seqs(ComponentName, "=", "GROUP SIZE");

    const components = seqs(tok(WParenLeftW), plus(alt(new ComponentCompare(), groupSize)), tok(WParenRightW));

    const into = seqs(opt(str("REFERENCE")), "INTO", Target);

    const assigning = seqs("ASSIGNING", FSTarget);

    const group = ver(Version.v740sp08,
                      seqs("GROUP BY",
                           alt(new Source(), components),
                           optPrio(str("ASCENDING")),
                           optPrio(str("WITHOUT MEMBERS")),
                           optPrio(alt(into, assigning))));

    const target = alt(seqs(alt(into, assigning),
                            optPrio(str("CASTING"))),
                       str("TRANSPORTING NO FIELDS"));

    const from = seqs("FROM", Source);

    const to = seqs("TO", Source);

    const usingKey = seqs("USING KEY", altPrio(new SimpleName(), new Dynamic()));

    const options = per(target, from, to, where, usingKey, group);

    const at = seqs("AT",
                    opt(ver(Version.v740sp08, str("GROUP"))),
                    alt(new BasicSource(), ver(Version.v740sp02, new Source())),
                    opt(options));

    return seqs("LOOP", opt(at));
  }

}