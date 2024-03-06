import {IStatement} from "./_statement";
import {str, optPrio, seq, per, plus, altPrio} from "../combi";
import {Target, SimpleSource3} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Concatenate implements IStatement {

  public getMatcher(): IStatementRunnable {
    const mode = seq("IN", altPrio("BYTE", "CHARACTER"), "MODE");
    const blanks = str("RESPECTING BLANKS");
    const sep = seq("SEPARATED BY", SimpleSource3);

    const options = per(mode, blanks, sep);

    const sourc = seq(SimpleSource3, plus(SimpleSource3));
    const lines = seq("LINES OF", SimpleSource3);

    return seq("CONCATENATE",
               altPrio(lines, sourc),
               "INTO",
               Target,
               optPrio(options));
  }

}