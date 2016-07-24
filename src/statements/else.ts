import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";

export class Else extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return Combi.str("ELSE");
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
    if (result === true) {
      return new Else(tokens);
    }
    return undefined;
  }

}