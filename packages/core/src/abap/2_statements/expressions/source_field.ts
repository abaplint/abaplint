import {Expression} from "../combi";
import {Field} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SourceField extends Expression {
  public getRunnable(): IStatementRunnable {
    return new Field();
  }
}