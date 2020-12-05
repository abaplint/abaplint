import {Expression, seqs, alt} from "../combi";
import {Field, Source, TypeName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class InlineFieldDefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(seqs(Field, "=", Source),
               seqs(Field, "TYPE", TypeName));
  }
}