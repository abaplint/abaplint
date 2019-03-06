import {seq, str, Expression, IStatementRunnable} from "../combi";
import {Source} from ".";

export class Or extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(str("OR"), new Source());
  }
}