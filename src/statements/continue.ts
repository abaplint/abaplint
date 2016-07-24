import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";

export class Continue extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return Combi.str("CONTINUE");
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
    if (result === true) {
      return new Continue(tokens);
    }
    return undefined;
  }

}