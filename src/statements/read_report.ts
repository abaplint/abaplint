import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class ReadReport extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("READ REPORT"),
               Reuse.source(),
               str("INTO"),
               Reuse.target(),
               opt(seq(str("STATE"), Reuse.source())));
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
    if (result === true) {
      return new ReadReport(tokens);
    }
    return undefined;
  }

}