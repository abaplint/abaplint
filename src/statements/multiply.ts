import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class Multiply extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("MULTIPLY"), Reuse.target(), str("BY"), Reuse.source());
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
    if (result === true) {
      return new Multiply(tokens);
    }
    return undefined;
  }

}