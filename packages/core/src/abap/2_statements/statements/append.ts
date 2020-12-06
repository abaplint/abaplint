import {IStatement} from "./_statement";
import {str, opt, alts, seqs, altPrio, optPrio, ver} from "../combi";
import {Version} from "../../../version";
import {FSTarget, Target, Field, Source, SimpleSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Append implements IStatement {

  public getMatcher(): IStatementRunnable {
    const assigning = seqs("ASSIGNING", FSTarget);
    const reference = seqs("REFERENCE INTO", Target);
    const sorted = seqs("SORTED BY", Field);

    const range = seqs(optPrio(seqs("FROM", Source)),
                       optPrio(seqs("TO", Source)));

    const src = alts(ver(Version.v740sp02, new Source()), SimpleSource);

    return seqs("APPEND",
                altPrio(str("INITIAL LINE"), seqs(optPrio(str("LINES OF")), src)),
                opt(range),
                optPrio(seqs("TO", Target)),
                opt(altPrio(assigning, reference)),
                optPrio(str("CASTING")),
                optPrio(sorted));
  }

}