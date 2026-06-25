import {seq, Expression, regex as reg} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class SQLExposeClientAs extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("EXPOSE CLIENT AS", reg(/^\w+$/));
  }
}
