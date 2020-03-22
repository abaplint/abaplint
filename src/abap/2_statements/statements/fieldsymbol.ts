import {IStatement} from "./_statement";
import {str, seq, alt, opt} from "../combi";
import {FieldSymbol as Name, Type, TypeTable} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class FieldSymbol implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(alt(str("FIELD-SYMBOL"), str("FIELD-SYMBOLS")),
               new Name(),
               opt(alt(new Type(), new TypeTable())));
  }

}