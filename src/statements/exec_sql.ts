import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class ExecSql extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let performing = seq(str("PERFORMING"), new Reuse.SimpleName());

    return seq(str("EXEC SQL"), opt(performing));
  }

}