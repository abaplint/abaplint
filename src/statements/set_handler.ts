import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class SetHandler extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("SET HANDLER"), Reuse.target(), str("FOR"), Reuse.target());
    return ret;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new SetHandler(tokens);
    }
    return undefined;
  }

}