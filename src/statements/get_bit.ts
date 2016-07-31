import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class GetBit extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("GET BIT"),
                  Reuse.source(),
                  str("OF"),
                  Reuse.source(),
                  str("INTO"),
                  Reuse.target());

    return ret;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new GetBit(tokens);
    }
    return undefined;
  }

}