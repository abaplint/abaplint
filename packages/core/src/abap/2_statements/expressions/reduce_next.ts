import {Expression, seq, plus, altPrio, tok} from "../combi";
import {Field, Source} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {WPlus} from "../../1_lexer/tokens";

export class ReduceNext extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = seq(Field, altPrio("=", seq(tok(WPlus), "=")), Source);
    return seq("NEXT", plus(fields));
  }
}