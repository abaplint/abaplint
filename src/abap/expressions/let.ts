import {seq, str, plus, Expression, IStatementRunnable} from "../combi";
import {InlineFieldDefinition} from "./inline_field_definition";

export class Let extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(str("LET"), plus(new InlineFieldDefinition()), str("IN"));
  }
}