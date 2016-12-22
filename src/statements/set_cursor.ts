import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;

export class SetCursor extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let field = seq(str("FIELD"), new Reuse.Source());
    let pos = seq(new Reuse.Source(), new Reuse.Source());
    let ret = seq(str("SET CURSOR"), alt(pos, field));
    return ret;
  }

}