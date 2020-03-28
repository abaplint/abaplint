import {IStatement} from "./_statement";
import {str, opt, seq, alt, per, plus, altPrio} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Concatenate implements IStatement {

  public getMatcher(): IStatementRunnable {
    const mode = seq(str("IN"),
                     alt(str("BYTE"), str("CHARACTER")),
                     str("MODE"));
    const blanks = str("RESPECTING BLANKS");
    const sep = seq(str("SEPARATED BY"), new Source());

    const options = per(mode, blanks, sep);

    const sourc = seq(new Source(), plus(new Source()));
    const lines = seq(str("LINES OF"), new Source());

    return seq(str("CONCATENATE"),
               altPrio(lines, sourc),
               str("INTO"),
               new Target(),
               opt(options));
  }

}