import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let plus = Combi.plus;

export class ModifyInternal extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let index = seq(str("INDEX"), new Reuse.Source());

    let from = seq(str("FROM"), new Reuse.Source());

    let transporting = seq(str("TRANSPORTING"), plus(new Reuse.Field()));

    let where = seq(str("WHERE"), new Reuse.Cond());

// make sure this does not conflict with MODIFY database
// todo, refactor
    let options = alt(seq(index, from),
                      index,
                      seq(transporting, where),
                      seq(index, transporting),
                      seq(from, transporting, opt(where)),
                      seq(from, index, opt(transporting)),
                      seq(index, from, opt(transporting)));


    let ret = seq(new Reuse.Target(),
                  opt(options));

    let ret2 = seq(str("TABLE"),
                   new Reuse.Target(),
                   from);

    return seq(str("MODIFY"), alt(ret, ret2));
  }

}