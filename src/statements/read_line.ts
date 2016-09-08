import { Statement } from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;

export class ReadLine extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("READ LINE"),
               new Reuse.Source(),
               str("LINE VALUE INTO"),
               new Reuse.Target());
  }

}