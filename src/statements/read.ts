import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;
let plus = Combi.plus;

export class Read extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let target = alt(seq(str("ASSIGNING"), Reuse.target()),
                     seq(str("INTO"), Reuse.target()));

    let index = seq(str("INDEX"), Reuse.source());

    let key = seq(alt(str("WITH KEY"), str("WITH TABLE KEY")), plus(Reuse.compare()));

    let noFields = str("TRANSPORTING NO FIELDS");

    return seq(str("READ TABLE"),
               Reuse.source(),
               opt(noFields),
               opt(index),
               opt(key),
               opt(target),
               opt(index),
               opt(seq(str("FROM"), Reuse.source())),
               opt(key),
               opt(str("BINARY SEARCH")),
               opt(noFields));
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
    if (result === true) {
      return new Read(tokens);
    }
    return undefined;
  }

}