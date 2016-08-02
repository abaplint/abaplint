import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let tok = Combi.tok;

export class Message extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let like = seq(str("DISPLAY LIKE"), Reuse.source());
    let type = seq(str("TYPE"), Reuse.source());
    let id = seq(str("ID"), Reuse.source());
    let num = seq(str("NUMBER"), Reuse.source());
    let into = seq(str("INTO"), Reuse.target());
    let mwith = seq(str("WITH"), Reuse.source(), opt(Reuse.source()), opt(Reuse.source()), opt(Reuse.source()));
    let raising = seq(str("RAISING"), Reuse.field());
    let msgid = seq(tok("ParenLeft"), Reuse.field(), str(")"));
    let simple = seq(Reuse.source(), opt(msgid), opt(mwith), opt(type), opt(like));
    let full = seq(id, type, num, mwith);

    let ret = seq(str("MESSAGE"), alt(simple, full), opt(into), opt(raising));

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