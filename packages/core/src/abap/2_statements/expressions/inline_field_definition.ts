import {Expression, seq, alt} from "../combi";
import {Field, Source, TypeName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class InlineFieldDefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(seq(Field, "=", Source),
               seq(Field, "TYPE", TypeName));
  }
}