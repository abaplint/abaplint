import {Expression, IStatementRunnable} from "../combi";
import {Field} from ".";

export class InlineField extends Expression {
  public getRunnable(): IStatementRunnable {
    return new Field();
  }
}