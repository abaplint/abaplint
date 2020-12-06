import {tok, alts, seqs, star, Expression} from "../combi";
import {Field, Constant} from ".";
import {WAt} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {FieldChain} from "./field_chain";

export class SQLCDSParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const param = seqs(Field, "=", alts(seqs(tok(WAt), FieldChain), Constant));
    return seqs("(", param, star(seqs(",", param)), ")");
  }
}