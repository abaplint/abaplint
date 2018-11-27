import {Statement} from "./_statement";
import {str, seq, regex as reg, alt, star, IStatementRunnable} from "../combi";
import {FieldSymbol as Name} from "../expressions";

export class FieldSymbol extends Statement {

  public getMatcher(): IStatementRunnable {
// todo, reuse type definition from DATA
    return seq(alt(str("FIELD-SYMBOL"), str("FIELD-SYMBOLS")),
               new Name(),
               star(reg(/^.*$/)));
  }

}