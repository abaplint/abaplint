import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class Class extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let def = seq(str("CLASS"),
                  Reuse.field(),
                  str("DEFINITION"),
                  opt(seq(str("INHERITING FROM"), Reuse.field())),
                  opt(str("FINAL")));

    let impl = seq(str("CLASS"), Reuse.field(), str("IMPLEMENTATION"));

    return alt(def, impl);
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
    if (result === true) {
      return new Class(tokens);
    }
    return undefined;
  }
}