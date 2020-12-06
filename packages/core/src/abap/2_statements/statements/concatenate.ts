import {IStatement} from "./_statement";
import {str, optPrio, seq, alt, per, plus, altPrio} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Concatenate implements IStatement {

  public getMatcher(): IStatementRunnable {
    const mode = seq("IN", alt("BYTE", "CHARACTER"), "MODE");
    const blanks = str("RESPECTING BLANKS");
    const sep = seq("SEPARATED BY", Source);

    const options = per(mode, blanks, sep);

    const sourc = seq(Source, plus(Source));
    const lines = seq("LINES OF", Source);

    return seq("CONCATENATE",
               altPrio(lines, sourc),
               "INTO",
               Target,
               optPrio(options));
  }

}