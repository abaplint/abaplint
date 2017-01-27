import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let per = Combi.per;

export class GetDataset extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let position = seq(str("POSITION"), new Reuse.Target());
    let attr = seq(str("ATTRIBUTES"), new Reuse.Target());

    let ret = seq(str("GET DATASET"),
                  new Reuse.Target(),
                  opt(per(position, attr)));

    return ret;
  }

}