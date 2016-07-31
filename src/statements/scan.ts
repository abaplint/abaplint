import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class Scan extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("SCAN ABAP-SOURCE"),
                  Reuse.source(),
                  str("TOKENS INTO"),
                  Reuse.target(),
                  str("STATEMENTS INTO"),
                  Reuse.target(),
                  str("WITH ANALYSIS"));

    return ret;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new Scan(tokens);
    }
    return undefined;
  }

}