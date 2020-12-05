import {seqs, tok, Expression, str, optPrio, altPrio, plusPrio, ver} from "../combi";
import {ParenRightW, WParenLeft, WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {FieldSub, Source, Let, For} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ValueBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const fieldList = seqs(FieldSub, "=", Source);

    const base = seqs("BASE", Source);

    // missing spaces caught by rule "parser_missing_space"
    const foo = seqs(altPrio(tok(WParenLeftW), tok(WParenLeft)),
                     optPrio(altPrio(plusPrio(fieldList), seqs(optPrio(str("LINES OF")), Source))),
                     altPrio(tok(WParenRightW), tok(ParenRightW)));

    const strucOrTab = seqs(optPrio(new Let()), optPrio(base), optPrio(new For()), plusPrio(altPrio(fieldList, foo)));

    const tabdef = ver(Version.v740sp08, altPrio(str("OPTIONAL"), seqs("DEFAULT", Source)));

    return optPrio(altPrio(strucOrTab, seqs(Source, optPrio(tabdef))));
  }
}