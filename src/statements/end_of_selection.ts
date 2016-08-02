import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";

let str = Combi.str;

export class EndOfSelection extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return str("END-OF-SELECTION");
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new EndOfSelection(tokens);
    }
    return undefined;
  }

}