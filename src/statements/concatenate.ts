import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let plus = Combi.plus;
let seq = Combi.seq;

export class Concatenate extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("CONCATENATE"), plus(Reuse.source()), str("INTO"), Reuse.target());
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new Concatenate(tokens);
    }
    return undefined;
  }

}