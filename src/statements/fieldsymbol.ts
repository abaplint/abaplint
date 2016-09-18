import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let reg = Combi.regex;
let alt = Combi.alt;
let star = Combi.star;

export class FieldSymbol extends Statement {

  public static get_matcher(): Combi.IRunnable {
// todo, reuse type definition from DATA
    return seq(alt(str("FIELD-SYMBOL"), str("FIELD-SYMBOLS")),
               new Reuse.FieldSymbol(),
               star(reg(/^.*$/)));
  }

}