import {regex as reg, Expression, IStatementRunnable} from "../combi";

export class FieldSymbol extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^<[\w\/%]+>$/);
  }
}