import {seqs, optPrio, alts, star, Expression} from "../combi";
import {FieldLength, TableExpression, ArrowOrDash, ComponentName, FieldOffset, AttributeName} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {TableBody} from "./table_body";

export class AttributeChain extends Expression {
  public getRunnable(): IStatementRunnable {

    const chain = seqs(AttributeName,
                       star(alts(seqs(ArrowOrDash, alts("*", ComponentName)),
                                 new TableExpression())));

    const ret = seqs(chain, optPrio(new TableBody()), optPrio(new FieldOffset()), optPrio(new FieldLength()));

    return ret;
  }
}