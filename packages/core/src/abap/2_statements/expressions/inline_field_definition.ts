import {Expression, seq, alts} from "../combi";
import {Field, Source, TypeName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class InlineFieldDefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    return alts(seq(Field, "=", Source),
                seq(Field, "TYPE", TypeName));
  }
}