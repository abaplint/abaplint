import {seqs, optPrio, alts, star, Expression} from "../combi";
import {FieldLength, TableExpression, ArrowOrDash, ComponentName, FieldOffset} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {TableBody} from "./table_body";

export class ComponentChain extends Expression {
  public getRunnable(): IStatementRunnable {

    const chain = seqs(ComponentName,
                       star(alts(seqs(ArrowOrDash, alts("*", ComponentName)), TableExpression)));

    const ret = seqs(chain, optPrio(new TableBody()), optPrio(new FieldOffset()), optPrio(new FieldLength()));

    return ret;
  }
}