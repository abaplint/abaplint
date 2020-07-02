import {seq, optPrio, alt, str, star, Expression} from "../combi";
import {FieldLength, TableExpression, ArrowOrDash, ComponentName, FieldOffset} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ComponentChain extends Expression {
  public getRunnable(): IStatementRunnable {

    const chain = seq(new ComponentName(),
                      star(alt(seq(new ArrowOrDash(), alt(str("*"), new ComponentName())), new TableExpression())));

    const ret = seq(chain, optPrio(new FieldOffset()), optPrio(new FieldLength()));

    return ret;
  }
}