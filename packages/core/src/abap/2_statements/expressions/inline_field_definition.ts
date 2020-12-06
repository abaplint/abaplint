import {Expression, seqs, alts} from "../combi";
import {Field, Source, TypeName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class InlineFieldDefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    return alts(seqs(Field, "=", Source),
                seqs(Field, "TYPE", TypeName));
  }
}