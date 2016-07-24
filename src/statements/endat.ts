import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";

export class Endat extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return Combi.str("ENDAT");
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
    if (result === true) {
      return new Endat(tokens);
    }
    return undefined;
  }

}