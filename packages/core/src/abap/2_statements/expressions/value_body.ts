import {seq, tok, Expression, str, optPrio, altPrio, plusPrio, ver} from "../combi";
import {ParenRightW, WParenLeft, WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {FieldSub, Source, Let, For} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ValueBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const fieldList = seq(new FieldSub(), str("="), new Source());

    const base = seq(str("BASE"), new Source());

    // missing spaces caught by rule "parser_missing_space"
    const foo = seq(altPrio(tok(WParenLeftW), tok(WParenLeft)),
                    optPrio(altPrio(plusPrio(fieldList), seq(optPrio(str("LINES OF")), new Source()))),
                    altPrio(tok(WParenRightW), tok(ParenRightW)));

    const strucOrTab = seq(optPrio(new Let()), optPrio(base), optPrio(new For()), plusPrio(altPrio(fieldList, foo)));

    const tabdef = ver(Version.v740sp08, altPrio(str("OPTIONAL"), seq(str("DEFAULT"), new Source())));

    return optPrio(altPrio(strucOrTab, seq(new Source(), optPrio(tabdef))));
  }
}