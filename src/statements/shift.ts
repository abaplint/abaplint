import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class Shift extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let dir = alt(str("LEFT DELETING LEADING"),
                  str("RIGHT DELETING TRAILING"),
                  str("RIGHT BY"),
                  str("LEFT BY"),
                  str("BY"));

    return seq(str("SHIFT"),
               Reuse.target(),
               opt(seq(dir,
                       Reuse.source(),
                       opt(str("PLACES")),
                       opt(str("IN CHARACTER MODE")))));
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
    if (result === true) {
      return new Shift(tokens);
    }
    return undefined;
  }

}