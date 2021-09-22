import {seq, Expression, optPrio} from "../combi";
import {Source, StringTemplateFormatting} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class StringTemplateSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(Source, optPrio(StringTemplateFormatting));
    return ret;
  }
}