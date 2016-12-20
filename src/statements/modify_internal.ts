import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class ModifyInternal extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let index = seq(str("INDEX"), new Reuse.Source());

    let from = seq(str("FROM"), new Reuse.Source());

    let transporting = seq(str("TRANSPORTING"), new Reuse.Field());

// make sure this does not conflict with MODIFY database
    let options = alt(seq(index, from),
                      index,
                      seq(from, transporting),
                      seq(from, index),
                      seq(index, from, transporting));


    let ret = seq(new Reuse.Target(),
                  opt(options));

    let ret2 = seq(str("TABLE"),
                   new Reuse.Target(),
                   from);

    return seq(str("MODIFY"), alt(ret, ret2));
  }

}