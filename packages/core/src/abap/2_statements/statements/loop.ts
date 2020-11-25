import {IStatement} from "./_statement";
import {str, seq, alt, opt, ver, altPrio, optPrio, tok, per, plus} from "../combi";
import {FSTarget, Target, ComponentCond, Dynamic, Source, ComponentCompare, SimpleName, ComponentName} from "../expressions";
import {Version} from "../../../version";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {BasicSource} from "../expressions/basic_source";

export class Loop implements IStatement {

  public getMatcher(): IStatementRunnable {
    const where = seq(str("WHERE"), alt(new ComponentCond(), new Dynamic()));

    const groupSize = seq(new ComponentName(), str("="), str("GROUP SIZE"));

    const components = seq(tok(WParenLeftW), plus(alt(new ComponentCompare(), groupSize)), tok(WParenRightW));

    const into = seq(opt(str("REFERENCE")), str("INTO"), new Target());

    const assigning = seq(str("ASSIGNING"), new FSTarget());

    const group = ver(Version.v740sp08,
                      seq(str("GROUP BY"),
                          alt(new Source(), components),
                          optPrio(str("ASCENDING")),
                          optPrio(str("WITHOUT MEMBERS")),
                          optPrio(alt(into, assigning))));

    const target = alt(seq(alt(into, assigning),
                           optPrio(str("CASTING"))),
                       str("TRANSPORTING NO FIELDS"));

    const from = seq(str("FROM"), new Source());

    const to = seq(str("TO"), new Source());

    const usingKey = seq(str("USING KEY"), altPrio(new SimpleName(), new Dynamic()));

    const options = per(target, from, to, where, usingKey, group);

    const at = seq(str("AT"),
                   opt(ver(Version.v740sp08, str("GROUP"))),
                   alt(new BasicSource(), ver(Version.v740sp02, new Source())),
                   opt(options));

    return seq(str("LOOP"), opt(at));
  }

}