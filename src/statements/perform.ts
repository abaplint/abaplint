import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let plus = Combi.plus;

export class Perform extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let using = seq(str("USING"), plus(Reuse.source()));
    let changing = seq(str("CHANGING"), plus(Reuse.source()));

    return seq(str("PERFORM"),
               Reuse.field(),
               opt(seq(str("IN PROGRAM"), Reuse.field())),
               opt(str("IF FOUND")),
               opt(using),
               opt(changing));
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
    if (result === true) {
      return new Perform(tokens);
    }
    return undefined;
  }

}