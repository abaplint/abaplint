import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str  = Combi.str;
let seq  = Combi.seq;

export class Assert extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("ASSERT"), Reuse.cond());
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
    if (result === true) {
      return new Assert(tokens);
    } else {
      return undefined;
    }
  }

}