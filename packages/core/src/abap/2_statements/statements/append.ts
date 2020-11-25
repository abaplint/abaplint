import {IStatement} from "./_statement";
import {str, opt, alt, seq, altPrio, optPrio, ver} from "../combi";
import {Version} from "../../../version";
import {FSTarget, Target, Field, Source, SimpleSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Append implements IStatement {

  public getMatcher(): IStatementRunnable {
    const assigning = seq(str("ASSIGNING"), new FSTarget());
    const reference = seq(str("REFERENCE INTO"), new Target());
    const sorted = seq(str("SORTED BY"), new Field());

    const range = seq(optPrio(seq(str("FROM"), new Source())),
                      optPrio(seq(str("TO"), new Source())));

    const src = alt(ver(Version.v740sp02, new Source()), new SimpleSource());

    return seq(str("APPEND"),
               altPrio(str("INITIAL LINE"), seq(optPrio(str("LINES OF")), src)),
               opt(range),
               optPrio(seq(str("TO"), new Target())),
               opt(altPrio(assigning, reference)),
               optPrio(str("CASTING")),
               optPrio(sorted));
  }

}