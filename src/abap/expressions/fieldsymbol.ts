import {regex as reg, Expression, IRunnable} from "../combi";

export class FieldSymbol extends Expression {
  public getRunnable(): IRunnable {
    return reg(/^<[\w\/%]+>$/);
  }
}