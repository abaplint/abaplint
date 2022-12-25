import {IStatement} from "./_statement";
import {seq, altPrio} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Translate implements IStatement {

  public getMatcher(): IStatementRunnable {
    const cas = seq("TO",
                    altPrio("UPPER", "LOWER"),
                    "CASE");

    const using = seq("USING", Source);

    return seq("TRANSLATE",
               Target,
               altPrio(cas, using));
  }

}