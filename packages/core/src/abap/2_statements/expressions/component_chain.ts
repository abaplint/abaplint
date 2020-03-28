import {seq, opt, optPrio, alt, str, plus, star, Expression} from "../combi";
import {FieldLength, TableExpression, ArrowOrDash, ComponentName, FieldOffset} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ComponentChain extends Expression {
  public getRunnable(): IStatementRunnable {

    const chain = seq(new ComponentName(),
                      optPrio(plus(new TableExpression())),
                      star(seq(new ArrowOrDash(), alt(str("*"), new ComponentName()), opt(plus(new TableExpression())))));

    const ret = seq(chain, optPrio(new FieldOffset()), optPrio(new FieldLength()));

    return ret;
  }
}