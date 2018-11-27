import {seq, str, plus, Expression, IStatementRunnable} from "../combi";
import {Source, FieldSub} from "./";

export class Let extends Expression {
  public getRunnable(): IStatementRunnable {
    const fieldList = seq(new FieldSub(), str("="), new Source());
    return seq(str("LET"), plus(fieldList), str("IN"));
  }
}