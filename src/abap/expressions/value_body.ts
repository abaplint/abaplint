import {seq, tok, Expression, IStatementRunnable, str, optPrio, altPrio, plusPrio, starPrio, ver, alt} from "../combi";
import {WParenLeftW, WParenRightW} from "../tokens/";
import {FieldSub, Source, Let, For} from ".";
import {Version} from "../../version";

export class ValueBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const fieldList = seq(new FieldSub(), str("="), new Source());

    const base = seq(str("BASE"), new Source());

    const foo = seq(tok(WParenLeftW), optPrio(altPrio(plusPrio(fieldList), seq(optPrio(str("LINES OF")), new Source()))), tok(WParenRightW));

    const strucOrTab = seq(optPrio(new Let()), optPrio(base), optPrio(new For()), starPrio(altPrio(fieldList, foo)));

    const tabdef = ver(Version.v740sp08, altPrio(str("OPTIONAL"), seq(str("DEFAULT"), new Source())));

    return alt(strucOrTab, seq(new Source(), optPrio(tabdef)));
  }
}