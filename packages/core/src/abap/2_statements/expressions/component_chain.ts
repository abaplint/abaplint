import {seq, optPrio, alt, stars, Expression} from "../combi";
import {FieldLength, TableExpression, ArrowOrDash, ComponentName, FieldOffset} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {TableBody} from "./table_body";

export class ComponentChain extends Expression {
  public getRunnable(): IStatementRunnable {

    const chain = seq(ComponentName,
                      stars(alt(seq(ArrowOrDash, alt("*", ComponentName)), TableExpression)));

    const ret = seq(chain, optPrio(TableBody), optPrio(FieldOffset), optPrio(FieldLength));

    return ret;
  }
}