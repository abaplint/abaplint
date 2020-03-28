import {Expression, seq, str, alt} from "../combi";
import {Field, Source, TypeName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class InlineFieldDefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(seq(new Field(), str("="), new Source()),
               seq(new Field(), str("TYPE"), new TypeName()));
  }
}