import {seq, optPrios, alts, stars, Expression} from "../combi";
import {FieldLength, TableExpression, ArrowOrDash, ComponentName, FieldOffset, AttributeName} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {TableBody} from "./table_body";

export class AttributeChain extends Expression {
  public getRunnable(): IStatementRunnable {

    const chain = seq(AttributeName,
                      stars(alts(seq(ArrowOrDash, alts("*", ComponentName)), TableExpression)));

    const ret = seq(chain, optPrios(TableBody), optPrios(FieldOffset), optPrios(FieldLength));

    return ret;
  }
}