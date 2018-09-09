import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, IRunnable} from "../combi";

export class AssignLocalCopy extends Statement {

  public static get_matcher(): IRunnable {

    let ret = seq(str("ASSIGN LOCAL COPY OF"),
                  opt(seq(str("INITIAL"), opt(str("LINE OF")))),
                  new Reuse.Source(),
                  str("TO"),
                  new Reuse.FieldSymbol());

    return ret;
  }

}