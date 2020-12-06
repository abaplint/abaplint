import {IStatement} from "./_statement";
import {seq, alt, opts} from "../combi";
import {FieldSymbol as Name, Type, TypeTable, TypeName, Field} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class FieldSymbol implements IStatement {

  public getMatcher(): IStatementRunnable {
    const stru = seq("STRUCTURE", TypeName, "DEFAULT", Field);

    return seq("FIELD-SYMBOLS",
               Name,
               opts(alt(Type, TypeTable, stru)));
  }

}