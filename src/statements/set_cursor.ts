import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, per, IRunnable} from "../combi";

export class SetCursor extends Statement {

  public static get_matcher(): IRunnable {
    let line = seq(str("LINE"), new Reuse.Source());
    let offset = seq(str("OFFSET"), new Reuse.Source());
    let field = seq(str("FIELD"), new Reuse.Source());
    let pos = seq(new Reuse.Source(), new Reuse.Source());
    let ret = seq(str("SET CURSOR"), per(pos, field, offset, line));
    return ret;
  }

}