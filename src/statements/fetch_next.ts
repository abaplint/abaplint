import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class FetchNext extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("FETCH NEXT CURSOR"),
                  new Reuse.Source(),
                  str("INTO TABLE"),
                  new Reuse.Target(),
                  str("PACKAGE SIZE"),
                  new Reuse.Source());

    return ret;
  }

}