import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class SetHandler extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("SET HANDLER"),
                  new Reuse.Target(),
                  str("FOR"),
                  new Reuse.Target());

    return ret;
  }

}