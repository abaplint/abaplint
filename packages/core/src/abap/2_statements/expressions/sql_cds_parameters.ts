import {tok, alt, seq, Expression, starPrio} from "../combi";
import {Field, Constant} from ".";
import {ParenLeft, ParenLeftW, WAt, WParenRightW, WParenRight} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {FieldChain} from "./field_chain";

export class SQLCDSParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const param = seq(Field, "=", alt(seq(tok(WAt), FieldChain), Constant));
    return seq(alt(tok(ParenLeft), tok(ParenLeftW)), param, starPrio(seq(",", param)), alt(tok(WParenRightW), tok(WParenRight)));
  }
}
