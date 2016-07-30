import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;

export class ReadLine extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("READ LINE"),
               Reuse.source(),
               str("LINE VALUE INTO"),
               Reuse.target());
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
    if (result === true) {
      return new ReadLine(tokens);
    }
    return undefined;
  }

}