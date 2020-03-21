import {seq, str, opt, Expression, altPrio} from "../combi";
import {Source} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Destination extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(str("DESTINATION"), opt(str("IN GROUP")), altPrio(str("DEFAULT"), new Source()));
  }
}