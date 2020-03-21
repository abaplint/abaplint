import {Expression} from "../combi";
import {Field} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class InlineField extends Expression {
  public getRunnable(): IStatementRunnable {
    return new Field();
  }
}