import {ver, seq, tok, alt, starPrio, altPrio, Expression} from "../combi";
import {SQLSource, Select, SimpleSource3} from ".";
import {At, ParenRight, ParenRightW, WParenLeft, WParenLeftW, WParenRight, WParenRightW} from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SQLIn extends Expression {
  public getRunnable(): IStatementRunnable {
    const val = new SQLSource();

    const short = seq(tok(At), SimpleSource3);

    const listOld = seq(tok(WParenLeft), alt(ver(Version.v740sp05, short), val), starPrio(seq(",", val)), altPrio(tok(ParenRight), tok(ParenRightW), tok(WParenRightW)));
    const listNew = seq(tok(WParenLeftW), val, starPrio(seq(",", val)), altPrio(tok(WParenRight), tok(WParenRightW)));
    const list = alt(listOld, ver(Version.v740sp02, listNew)); // version is a guess, https://github.com/abaplint/abaplint/issues/2530

    const subSelect = seq("(", Select, ")");

    const inn = seq("IN", altPrio(SQLSource, list, subSelect));

    return inn;
  }
}