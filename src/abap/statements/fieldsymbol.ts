import {Statement} from "./statement";
import {str, seq, regex as reg, alt, star, IRunnable} from "../combi";
import {FieldSymbol as Name} from "../expressions";

export class FieldSymbol extends Statement {

  public getMatcher(): IRunnable {
// todo, reuse type definition from DATA
    return seq(alt(str("FIELD-SYMBOL"), str("FIELD-SYMBOLS")),
               new Name(),
               star(reg(/^.*$/)));
  }

}