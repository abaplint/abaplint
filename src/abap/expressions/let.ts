import {seq, str, plus, Expression, IRunnable} from "../combi";
import {Source, FieldSub} from "./";

export class Let extends Expression {
  public getRunnable(): IRunnable {
    const fieldList = seq(new FieldSub(), str("="), new Source());
    return seq(str("LET"), plus(fieldList), str("IN"));
  }
}