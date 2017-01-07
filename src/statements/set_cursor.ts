import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let per = Combi.per;

export class SetCursor extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let line = seq(str("LINE"), new Reuse.Source());
    let offset = seq(str("OFFSET"), new Reuse.Source());
    let field = seq(str("FIELD"), new Reuse.Source());
    let pos = seq(new Reuse.Source(), new Reuse.Source());
    let ret = seq(str("SET CURSOR"), per(pos, field, offset, line));
    return ret;
  }

}