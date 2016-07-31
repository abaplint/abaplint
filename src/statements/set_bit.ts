import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class SetBit extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("SET BIT"),
                  Reuse.source(),
                  str("OF"),
                  Reuse.target(),
                  opt(seq(str("TO"), Reuse.source())));

    return ret;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new SetBit(tokens);
    }
    return undefined;
  }

}