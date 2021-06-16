import {seq, optPrio, altPrio, starPrio, Expression} from "../combi";
import {FieldLength, TableExpression, ArrowOrDash, ComponentName, FieldOffset, AttributeName} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {TableBody} from "./table_body";

export class AttributeChain extends Expression {
  public getRunnable(): IStatementRunnable {

    const chain = seq(AttributeName,
                      starPrio(altPrio(seq(ArrowOrDash, altPrio("*", ComponentName)), TableExpression)));

    const ret = seq(chain, optPrio(TableBody), optPrio(FieldOffset), optPrio(FieldLength));

    return ret;
  }
}