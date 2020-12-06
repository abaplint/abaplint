import {tok, alt, seq, star, Expression} from "../combi";
import {Field, Constant} from ".";
import {WAt} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {FieldChain} from "./field_chain";

export class SQLCDSParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const param = seq(Field, "=", alt(seq(tok(WAt), FieldChain), Constant));
    return seq("(", param, star(seq(",", param)), ")");
  }
}