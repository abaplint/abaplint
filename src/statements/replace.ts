import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class Replace extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let option = alt(str("ALL OCCURRENCES"), str("FIRST OCCURRENCE"));

    return seq(str("REPLACE"),
               option,
               str("OF"),
               opt(str("REGEX")),
               Reuse.source(),
               str("IN"),
               Reuse.target(),
               str("WITH"),
               Reuse.source(),
               opt(str("IGNORING CASE")));
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
    if (result === true) {
      return new Replace(tokens);
    }
    return undefined;
  }

}