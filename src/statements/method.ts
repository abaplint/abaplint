import { Statement } from "./statement";
import { Token } from "../tokens";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let reg = Combi.regex;

export class Method extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("METHOD"), reg(/[\w~]+/));
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new Method(tokens);
    }
    return undefined;
  }

}