import {Statement} from "./_statement";
import {str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class ConvertText extends Statement {

  public getMatcher(): IRunnable {
    return seq(str("CONVERT TEXT"),
               new Source(),
               str("INTO SORTABLE CODE"),
               new Target());
  }

}