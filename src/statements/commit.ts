import { Statement } from "./statement";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class Commit extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("COMMIT WORK"),
               opt(str("AND WAIT")));
  }

}