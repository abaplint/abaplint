import { Statement } from "./statement";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let tok = Combi.tok;
let per = Combi.per;

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
    let full = seq(id, type, num);

    let options = per(full, mwith, into, raising, simple);

    let ret = seq(str("MESSAGE"), options);

    return ret;
  }

}