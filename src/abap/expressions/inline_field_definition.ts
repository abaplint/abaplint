import {Expression, IStatementRunnable, seq, str, alt} from "../combi";
import {Field, Source, TypeName} from ".";

export class InlineFieldDefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(seq(new Field(), str("="), new Source()),
               seq(new Field(), str("TYPE"), new TypeName()));
  }
}