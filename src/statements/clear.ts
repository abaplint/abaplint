import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let star = Combi.star;
let reg = Combi.regex;

export class Clear extends Statement {

  public static get_matcher(): Combi.IRunnable {
// todo
    return seq(str("CLEAR"), star(reg(/.*/)));
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
    if (result === true) {
      return new Clear(tokens);
    }
    return undefined;
  }

}