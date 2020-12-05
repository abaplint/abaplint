import {Dash} from "../../1_lexer/tokens";
import {Expression, starPrio, seqs, tok} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Field} from "./field";

/** non class based exception name */
export class ExceptionName extends Expression {
  public getRunnable(): IStatementRunnable {
    return seqs(Field, starPrio(seqs(tok(Dash), Field)));
  }
}