import {Expression, IStatementRunnable} from "../combi";
import {Field} from ".";

export class TargetField extends Expression {
  public getRunnable(): IStatementRunnable {
    return new Field();
  }
}