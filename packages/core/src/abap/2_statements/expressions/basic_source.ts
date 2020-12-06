import {seqs, star, Expression, altPrios} from "../combi";
import {Constant, FieldChain, StringTemplate} from ".";
import {IStatementRunnable} from "../statement_runnable";

/** Reduced version of SimpleSource, omits MethodCallChains. */
export class BasicSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const concat = seqs("&&", StringTemplate);
    const template = seqs(StringTemplate, star(concat));

    return altPrios(Constant, template, FieldChain);
  }
}