import {Expression, seq, opt, plus} from "../combi";
import {Let, For, InlineFieldDefinition} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {ReduceNext} from "./reduce_next";

export class ReduceBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const init = seq("INIT", plus(InlineFieldDefinition));

    return seq(opt(Let),
               init,
               plus(For),
               ReduceNext);
  }
}