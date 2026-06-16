import {ver, seq, tok, alt, starPrio, altPrio, Expression} from "../combi";
import {SQLSource, SQLSourceNoSpace} from ".";
import {ParenRight, ParenRightW, WParenLeft, WParenLeftW, WParenRight, WParenRightW} from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLSetOpGroup} from "./sql_set_op_group";
import {buildSelectCore} from "./_select_core";

export class SQLIn extends Expression {
  public getRunnable(): IStatementRunnable {
    const val = new SQLSource();
    const short = new SQLSourceNoSpace();

    const listOld = seq(tok(WParenLeft), alt(ver(Version.v740sp05, short, Version.OpenABAP), val), starPrio(seq(",", val)), altPrio(tok(ParenRight), tok(ParenRightW), tok(WParenRightW)));
    const listNew = seq(tok(WParenLeftW), val, starPrio(seq(",", altPrio(short, val))), altPrio(tok(WParenRight), tok(WParenRightW)));
    // version is a guess, https://github.com/abaplint/abaplint/issues/2530
    const listNeww = ver(Version.v740sp02, listNew, Version.OpenABAP);

    const subSelect = SQLSetOpGroup;
    // simple subquery for pre-v750 versions: IN ( SELECT ... ), https://github.com/abaplint/abaplint/issues/3999
    const simpleSubSelect = seq("(", "SELECT", buildSelectCore(undefined, false), ")");

    const inn = seq("IN", altPrio(subSelect, simpleSubSelect, listOld, listNeww, SQLSource));

    return inn;
  }
}