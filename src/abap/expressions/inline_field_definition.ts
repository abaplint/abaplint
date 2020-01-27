import {Expression, IStatementRunnable, seq, str, alt} from "../combi";
import {Field, Source} from ".";
import {TypeName} from "./type_name";

export class InlineFieldDefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(seq(new Field(), str("TYPE"), new TypeName()),
               seq(new Field(), str("="), new Source()));
  }
}