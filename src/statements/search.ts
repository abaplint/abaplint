import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;

export class Search extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("SEARCH"), Reuse.source(), str("FOR"), Reuse.source());
    return ret;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new Search(tokens);
    }
    return undefined;
  }

}