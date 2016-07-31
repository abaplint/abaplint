import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let per = Combi.per;
let alt = Combi.alt;
let plus = Combi.plus;

export class Submit extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let awith = seq(str("WITH"), Reuse.field(), str("="), Reuse.source());
    let prog = alt(Reuse.source(), seq(str("("), Reuse.field_chain(), str(")")));
    let perm = per(plus(awith), str("AND RETURN"));
    let ret = seq(str("SUBMIT"), prog, opt(str("VIA SELECTION-SCREEN")), opt(perm));
    return ret;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new Submit(tokens);
    }
    return undefined;
  }

}