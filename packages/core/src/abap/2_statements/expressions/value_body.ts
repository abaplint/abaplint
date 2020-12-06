import {seqs, tok, Expression, optPrios, altPrios, plusPrio, ver} from "../combi";
import {ParenRightW, WParenLeft, WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {FieldSub, Source, Let, For} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ValueBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const fieldList = seqs(FieldSub, "=", Source);

    const base = seqs("BASE", Source);

    // missing spaces caught by rule "parser_missing_space"
    const foo = seqs(altPrios(tok(WParenLeftW), tok(WParenLeft)),
                     optPrios(altPrios(plusPrio(fieldList), seqs(optPrios("LINES OF"), Source))),
                     altPrios(tok(WParenRightW), tok(ParenRightW)));

    const strucOrTab = seqs(optPrios(Let), optPrios(base), optPrios(For), plusPrio(altPrios(fieldList, foo)));

    const tabdef = ver(Version.v740sp08, altPrios("OPTIONAL", seqs("DEFAULT", Source)));

    return optPrios(altPrios(strucOrTab, seqs(Source, optPrios(tabdef))));
  }
}