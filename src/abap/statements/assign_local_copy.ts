import {Statement} from "./statement";
import {str, seq, opt, IRunnable, alt} from "../combi";
import {FieldSymbol, Source, Dynamic} from "../expressions";

export class AssignLocalCopy extends Statement {

  public get_matcher(): IRunnable {

    let ret = seq(str("ASSIGN LOCAL COPY OF"),
                  opt(seq(str("INITIAL"), opt(str("LINE OF")))),
                  alt(new Source(), new Dynamic()),
                  str("TO"),
                  new FieldSymbol());

    return ret;
  }

}