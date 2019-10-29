import {Expression, IStatementRunnable, regex as reg} from "../combi";

export class TextElementKey extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^\w{3}$/);
  }
}