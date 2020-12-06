import {IStatement} from "./_statement";
import {str, optPrios, seq, alt, pers, pluss, altPrios} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Concatenate implements IStatement {

  public getMatcher(): IStatementRunnable {
    const mode = seq("IN", alt("BYTE", "CHARACTER"), "MODE");
    const blanks = str("RESPECTING BLANKS");
    const sep = seq("SEPARATED BY", Source);

    const options = pers(mode, blanks, sep);

    const sourc = seq(Source, pluss(Source));
    const lines = seq("LINES OF", Source);

    return seq("CONCATENATE",
               altPrios(lines, sourc),
               "INTO",
               Target,
               optPrios(options));
  }

}