import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class GetTimeStamp extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("GET TIME STAMP FIELD"), new Reuse.Target());
    return ret;
  }

}