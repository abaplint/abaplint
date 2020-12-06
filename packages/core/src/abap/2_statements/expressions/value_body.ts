import {seq, tok, Expression, optPrios, altPrios, plusPrios, vers} from "../combi";
import {ParenRightW, WParenLeft, WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {FieldSub, Source, Let, For} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ValueBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const fieldList = seq(FieldSub, "=", Source);

    const base = seq("BASE", Source);

    // missing spaces caught by rule "parser_missing_space"
    const foo = seq(altPrios(tok(WParenLeftW), tok(WParenLeft)),
                    optPrios(altPrios(plusPrios(fieldList), seq(optPrios("LINES OF"), Source))),
                    altPrios(tok(WParenRightW), tok(ParenRightW)));

    const strucOrTab = seq(optPrios(Let), optPrios(base), optPrios(For), plusPrios(altPrios(fieldList, foo)));

    const tabdef = vers(Version.v740sp08, altPrios("OPTIONAL", seq("DEFAULT", Source)));

    return optPrios(altPrios(strucOrTab, seq(Source, optPrios(tabdef))));
  }
}