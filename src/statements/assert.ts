import { Statement } from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let plus = Combi.plus;

export class Assert extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let fields = seq(str("FIELDS"), plus(new Reuse.Source()));

    return seq(str("ASSERT"), opt(fields), opt(str("CONDITION")), new Reuse.Cond());
  }

}