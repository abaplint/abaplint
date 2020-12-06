import {IStatement} from "./_statement";
import {seq, alt} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Translate implements IStatement {

  public getMatcher(): IStatementRunnable {
    const cas = seq("TO",
                    alt("UPPER", "LOWER"),
                    "CASE");

    const using = seq("USING", Source);

    return seq("TRANSLATE",
               Target,
               alt(cas, using));
  }

}