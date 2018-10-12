import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class ConvertText extends Statement {

  public get_matcher(): IRunnable {
    return seq(str("CONVERT TEXT"),
               new Source(),
               str("INTO SORTABLE CODE"),
               new Target());
  }

}