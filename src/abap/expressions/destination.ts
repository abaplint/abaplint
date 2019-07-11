import {seq, str, opt, Expression, IStatementRunnable, altPrio} from "../combi";
import {Source} from ".";

export class Destination extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(str("DESTINATION"), opt(str("IN GROUP")), altPrio(str("DEFAULT"), new Source()));
  }
}