import {IStatement} from "./_statement";
import {str, optPrios, seqs, alts, pers, pluss, altPrios} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Concatenate implements IStatement {

  public getMatcher(): IStatementRunnable {
    const mode = seqs("IN", alts("BYTE", "CHARACTER"), "MODE");
    const blanks = str("RESPECTING BLANKS");
    const sep = seqs("SEPARATED BY", Source);

    const options = pers(mode, blanks, sep);

    const sourc = seqs(Source, pluss(Source));
    const lines = seqs("LINES OF", Source);

    return seqs("CONCATENATE",
                altPrios(lines, sourc),
                "INTO",
                Target,
                optPrios(options));
  }

}