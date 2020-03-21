import {Expression, IStatementRunnable} from "../combi";
import {Field} from ".";

export class SourceField extends Expression {
  public getRunnable(): IStatementRunnable {
    return new Field();
  }
}