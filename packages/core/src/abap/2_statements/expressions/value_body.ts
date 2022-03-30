import {seq, tok, Expression, optPrio, altPrio, plusPrio, ver, star} from "../combi";
import {ParenRightW, WParenLeft, WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Source, Let, For, FieldAssignment} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ValueBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const base = seq("BASE", Source);

    const range = seq(optPrio(seq("FROM", Source)), optPrio(seq("TO", Source)));
    const lines = seq("LINES OF", Source, range);

    // missing spaces caught by rule "parser_missing_space"
    const foo = seq(altPrio(tok(WParenLeftW), tok(WParenLeft)),
                    optPrio(altPrio(plusPrio(FieldAssignment), lines, Source)),
                    altPrio(tok(WParenRightW), tok(ParenRightW)));

    const strucOrTab = seq(optPrio(Let), optPrio(base), star(For), plusPrio(altPrio(FieldAssignment, foo)));

    const tabdef = ver(Version.v740sp08, altPrio("OPTIONAL", seq("DEFAULT", Source)));

    return optPrio(altPrio(strucOrTab, seq(Source, optPrio(tabdef))));
  }
}