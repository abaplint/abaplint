import {Expression, seq, altPrio} from "../combi";
import {Field, FieldSymbol, Source, TypeName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class InlineFieldDefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    const field = altPrio(Field, FieldSymbol);
    return altPrio(seq(field, "=", Source),
                   seq(Field, "TYPE", TypeName));
  }
}
