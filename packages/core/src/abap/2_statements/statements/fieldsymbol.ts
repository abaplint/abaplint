import {IStatement} from "./_statement";
import {seqs, alt, opt} from "../combi";
import {FieldSymbol as Name, Type, TypeTable, TypeName, Field} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class FieldSymbol implements IStatement {

  public getMatcher(): IStatementRunnable {
    const stru = seqs("STRUCTURE", TypeName, "DEFAULT", Field);

    return seqs("FIELD-SYMBOLS",
                Name,
                opt(alt(new Type(), new TypeTable(), stru)));
  }

}