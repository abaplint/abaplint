import {Dash} from "../../1_lexer/tokens";
import {Expression, starPrio, seq, tok} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Field} from "./field";

/** non class based exception name */
export class ExceptionName extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(new Field(), starPrio(seq(tok(Dash), new Field())));
  }
}