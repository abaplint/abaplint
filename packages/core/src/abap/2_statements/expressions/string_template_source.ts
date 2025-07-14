import {seq, Expression, optPrio, alt} from "../combi";
import {Dereference, SimpleFieldChain2, Source, StringTemplateFormatting} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class StringTemplateSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const deref = seq(SimpleFieldChain2, optPrio(Dereference));
    const ret = seq(alt(Source, deref), optPrio(StringTemplateFormatting));
    return ret;
  }
}