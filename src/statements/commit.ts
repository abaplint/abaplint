import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class Commit extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("COMMIT WORK"), opt(str("AND WAIT")));
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
    if (result === true) {
      return new Commit(tokens);
    }
    return undefined;
  }

}