import {alt, seq, ver, tok, Expression, optPrio} from "../combi";
import {Version} from "../../../version";
import {WAt, ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {TableBody, Source, FieldChain} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLSourceSimple extends Expression {
  public getRunnable(): IStatementRunnable {
    const paren = seq(tok(ParenLeftW), new Source(), tok(WParenRightW));

    const at = ver(Version.v740sp05, seq(tok(WAt), alt(new FieldChain(), paren)));

    return alt(seq(new FieldChain(), optPrio(new TableBody())), at);
  }
}