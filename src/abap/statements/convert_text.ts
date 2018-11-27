import {Statement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class ConvertText extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("CONVERT TEXT"),
               new Source(),
               str("INTO SORTABLE CODE"),
               new Target());
  }

}