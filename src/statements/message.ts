import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class Message extends Statement {

  public static get_matcher(): Combi.IRunnable {

    let like = seq(str("DISPLAY LIKE"), Reuse.source());
    let type = seq(str("TYPE"), Reuse.source());
    let id = seq(str("ID"), Reuse.source());
    let num = seq(str("NUMBER"), Reuse.source());
    let into = seq(str("INTO"), Reuse.target());
    let mwith = seq(str("WITH"), Reuse.source(), opt(Reuse.source()), opt(Reuse.source()), opt(Reuse.source()));

    let simple = seq(Reuse.source(), type, opt(like));

    let full = seq(id, type, num, mwith, opt(into));

    let ret = seq(str("MESSAGE"), alt(simple, full));

    return ret;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new Message(tokens);
    }
    return undefined;
  }

}