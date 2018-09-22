import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {FieldSymbol, Source} from "../expressions";

export class AssignLocalCopy extends Statement {

  public static get_matcher(): IRunnable {

    let ret = seq(str("ASSIGN LOCAL COPY OF"),
                  opt(seq(str("INITIAL"), opt(str("LINE OF")))),
                  new Source(),
                  str("TO"),
                  new FieldSymbol());

    return ret;
  }

}