import {Statement} from "./_statement";
import {str, seq, alt, opt, ver, optPrio, tok, plus, per, IStatementRunnable} from "../combi";
import {FSTarget, Target, ComponentCond, Dynamic, Source, ComponentCompare, SimpleName} from "../expressions";
import {Version} from "../../../version";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";

export class Loop extends Statement {

  public getMatcher(): IStatementRunnable {
    const where = seq(str("WHERE"), alt(new ComponentCond(), new Dynamic()));

    const components = seq(tok(WParenLeftW), plus(new ComponentCompare()), tok(WParenRightW));

    const into = seq(str("INTO"), new Target());

    const assigning = seq(str("ASSIGNING"), new FSTarget());

    const group = ver(Version.v740sp08, seq(str("GROUP BY"), alt(new Source(), components), optPrio(str("ASCENDING")), optPrio(alt(into, assigning))));

    const rinto = seq(opt(str("REFERENCE")), into);

    const target = alt(seq(alt(rinto, assigning),
                           opt(group),
                           opt(str("CASTING"))),
                       str("TRANSPORTING NO FIELDS"));

    const from = seq(str("FROM"), new Source());

    const to = seq(str("TO"), new Source());

    const usingKey = seq(str("USING KEY"), alt(new SimpleName(), new Dynamic()));

    const options = per(target, from, to, where, usingKey);

    const at = seq(str("AT"),
                   opt(ver(Version.v740sp08, str("GROUP"))),
                   new Source(),
                   opt(options));

    return seq(str("LOOP"), opt(at));
  }

}