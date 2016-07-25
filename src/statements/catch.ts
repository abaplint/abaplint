import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let opt = Combi.opt;
let seq = Combi.seq;
let plus = Combi.plus;

export class Catch extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("CATCH"), plus(Reuse.field()), opt(seq(str("INTO"), Reuse.target())));
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new Catch(tokens);
    }
    return undefined;
  }

}