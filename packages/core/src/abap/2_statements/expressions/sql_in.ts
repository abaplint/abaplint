import {ver, seq, tok, alt, starPrio, altPrio, Expression} from "../combi";
import {SQLSource, Select, SQLSourceNoSpace} from ".";
import {ParenRight, ParenRightW, WParenLeft, WParenLeftW, WParenRight, WParenRightW} from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SQLIn extends Expression {
  public getRunnable(): IStatementRunnable {
    const val = new SQLSource();
    const short = new SQLSourceNoSpace();

    const listOld = seq(tok(WParenLeft), alt(ver(Version.v740sp05, short, Version.OpenABAP), val), starPrio(seq(",", val)), altPrio(tok(ParenRight), tok(ParenRightW), tok(WParenRightW)));
    const listNew = seq(tok(WParenLeftW), val, starPrio(seq(",", altPrio(short, val))), altPrio(tok(WParenRight), tok(WParenRightW)));
    // version is a guess, https://github.com/abaplint/abaplint/issues/2530
    const listNeww = ver(Version.v740sp02, listNew, Version.OpenABAP);

    const subSelect = seq(tok(WParenLeftW), Select, tok(WParenRightW));

    const inn = seq("IN", alt(subSelect, SQLSource, listOld, listNeww));

    return inn;
  }
}