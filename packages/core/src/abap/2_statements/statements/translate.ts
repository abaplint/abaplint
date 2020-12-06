import {IStatement} from "./_statement";
import {seq, alts} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Translate implements IStatement {

  public getMatcher(): IStatementRunnable {
    const cas = seq("TO",
                    alts("UPPER", "LOWER"),
                    "CASE");

    const using = seq("USING", Source);

    return seq("TRANSLATE",
               Target,
               alts(cas, using));
  }

}