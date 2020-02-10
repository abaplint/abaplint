import {seq, str, plus, Expression, IStatementRunnable} from "../combi";
import {InlineFieldDefinition} from "./";

export class Let extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(str("LET"), plus(new InlineFieldDefinition()), str("IN"));
  }
}