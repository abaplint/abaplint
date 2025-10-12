import {Expression, seq, starPrio, tok} from "../combi";
import {Field, FieldAll} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Dash} from "../../1_lexer/tokens";

export class InlineField extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(Field, starPrio(seq(tok(Dash), FieldAll)));
  }
}