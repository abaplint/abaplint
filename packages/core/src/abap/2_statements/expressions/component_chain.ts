import {seq, optPrio, alt, str, star, Expression} from "../combi";
import {FieldLength, TableExpression, ArrowOrDash, ComponentName, FieldOffset} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {TableBody} from "./table_body";

export class ComponentChain extends Expression {
  public getRunnable(): IStatementRunnable {

    const chain = seq(new ComponentName(),
                      star(alt(seq(new ArrowOrDash(), alt(str("*"), new ComponentName())), new TableExpression())));

    const ret = seq(chain, optPrio(new TableBody()), optPrio(new FieldOffset()), optPrio(new FieldLength()));

    return ret;
  }
}