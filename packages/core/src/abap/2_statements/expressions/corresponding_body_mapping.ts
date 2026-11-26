import {seq, Expression, plus, alt, tok, optPrio} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {ComponentChain, ComponentName, Field} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class CorrespondingBodyMapping extends Expression {
  public getRunnable(): IStatementRunnable {
    const single = seq(ComponentName, "=", ComponentChain);

    // mapping rule for a sub structure or tabular component, with its own MAPPING and EXCEPT
    const nested = seq(
      tok(WParenLeftW),
      single,
      optPrio(CorrespondingBodyMapping),
      optPrio(seq("EXCEPT", alt(plus(Field), "*"))),
      tok(WParenRightW));

    const mapping = seq("MAPPING", plus(alt(single, nested)));
    return mapping;
  }
}
