import {tok, alt, str, seq, star, Expression} from "../combi";
import {Field, Constant} from ".";
import {WAt} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class SQLCDSParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const param = seq(new Field(), str("="), alt(seq(tok(WAt), new Field()), new Constant()));
    return seq(str("("), param, star(seq(str(","), param)), str(")"));
  }
}