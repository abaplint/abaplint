import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class AssignLocalCopy extends Statement {

  public static get_matcher(): Combi.IRunnable {

    let ret = seq(str("ASSIGN LOCAL COPY OF INITIAL LINE OF"),
                  new Reuse.Source(),
                  str("TO"),
                  new Reuse.FieldSymbol());

    return ret;
  }

}