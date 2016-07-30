import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class CallFunction extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let starting = seq(str("STARTING NEW TASK"), Reuse.constant());
    let call = seq(str("CALL FUNCTION"), Reuse.constant(), opt(starting), Reuse.function_parameters());
    return call;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
    if (result === true) {
      return new CallFunction(tokens);
    }
    return undefined;
  }

}