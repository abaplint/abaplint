import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let star = Combi.star;

export class When extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("WHEN"), Reuse.source(), star(seq(str("OR"), Reuse.source())));
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
    if (result === true) {
      return new When(tokens);
    }
    return undefined;
  }

}