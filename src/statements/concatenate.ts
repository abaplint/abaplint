import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let opt = Combi.opt;
let seq = Combi.seq;
let plus = Combi.plus;

export class Concatenate extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("CONCATENATE"),
               Reuse.source(),
               plus(Reuse.source()),
               str("INTO"),
               Reuse.target(),
               opt(str("IN BYTE MODE")),
               opt(str("RESPECTING BLANKS")),
               opt(seq(str("SEPARATED BY"), Reuse.source())));
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new Concatenate(tokens);
    }
    return undefined;
  }

}