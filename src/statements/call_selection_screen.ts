import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class CallSelectionScreen extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let call = seq(str("CALL SELECTION-SCREEN"), Reuse.integer());
    return call;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
    if (result === true) {
      return new CallSelectionScreen(tokens);
    }
    return undefined;
  }

}