import { Statement } from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class ReadReport extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("READ REPORT"),
               new Reuse.Source(),
               str("INTO"),
               new Reuse.Target(),
               opt(seq(str("STATE"), new Reuse.Source())));
  }

}