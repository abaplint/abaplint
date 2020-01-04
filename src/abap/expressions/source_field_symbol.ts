import {Expression, IStatementRunnable} from "../combi";
import {FieldSymbol} from ".";

export class SourceFieldSymbol extends Expression {
  public getRunnable(): IStatementRunnable {
    return new FieldSymbol();
  }
}