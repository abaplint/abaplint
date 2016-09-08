import { Statement } from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;

export class Collect extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("COLLECT"),
               new Reuse.Source(),
               str("INTO"),
               new Reuse.Target());
  }

}