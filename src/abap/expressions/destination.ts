import {seq, str, opt, Expression, IStatementRunnable} from "../combi";
import {Source} from ".";

export class Destination extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(str("DESTINATION"), opt(str("IN GROUP")), new Source());
  }
}