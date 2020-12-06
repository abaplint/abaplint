import {seq, tok, Expression, optPrio, altPrio, plusPrios, vers} from "../combi";
import {ParenRightW, WParenLeft, WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {FieldSub, Source, Let, For} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ValueBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const fieldList = seq(FieldSub, "=", Source);

    const base = seq("BASE", Source);

    // missing spaces caught by rule "parser_missing_space"
    const foo = seq(altPrio(tok(WParenLeftW), tok(WParenLeft)),
                    optPrio(altPrio(plusPrios(fieldList), seq(optPrio("LINES OF"), Source))),
                    altPrio(tok(WParenRightW), tok(ParenRightW)));

    const strucOrTab = seq(optPrio(Let), optPrio(base), optPrio(For), plusPrios(altPrio(fieldList, foo)));

    const tabdef = vers(Version.v740sp08, altPrio("OPTIONAL", seq("DEFAULT", Source)));

    return optPrio(altPrio(strucOrTab, seq(Source, optPrio(tabdef))));
  }
}