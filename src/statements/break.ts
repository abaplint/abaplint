import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;

export class Break extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return alt(str("BREAK-POINT"), seq(str("BREAK"), Reuse.field()));
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new Break(tokens);
    }
    return undefined;
  }

}