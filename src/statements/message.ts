import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";
import {ParenLeft} from "../tokens";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let tok = Combi.tok;
let per = Combi.per;

export class Message extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let like = seq(str("DISPLAY LIKE"), new Reuse.Source());
    let type = seq(str("TYPE"), new Reuse.Source());
    let id = seq(str("ID"), new Reuse.Source());
    let num = seq(str("NUMBER"), new Reuse.Source());
    let into = seq(str("INTO"), new Reuse.Target());
    let mwith = seq(str("WITH"), new Reuse.Source(), opt(new Reuse.Source()), opt(new Reuse.Source()), opt(new Reuse.Source()));
    let raising = seq(str("RAISING"), new Reuse.Field());
    let msgid = seq(tok(ParenLeft), new Reuse.MessageClass(), str(")"));
    let simple = seq(new Reuse.Source(), opt(msgid), opt(mwith), opt(type));
    let full = seq(id, type, num);

    let options = per(full, mwith, into, raising, like, simple);

    let ret = seq(str("MESSAGE"), options);

    return ret;
  }

}