import {Expression, IStatementRunnable} from "../combi";
import {FieldSymbol} from ".";

export class TargetFieldSymbol extends Expression {
  public getRunnable(): IStatementRunnable {
    return new FieldSymbol();
  }
}