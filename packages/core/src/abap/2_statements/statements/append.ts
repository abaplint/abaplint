import {IStatement} from "./_statement";
import {opts, alts, seqs, altPrios, optPrios, ver} from "../combi";
import {Version} from "../../../version";
import {FSTarget, Target, Field, Source, SimpleSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Append implements IStatement {

  public getMatcher(): IStatementRunnable {
    const assigning = seqs("ASSIGNING", FSTarget);
    const reference = seqs("REFERENCE INTO", Target);
    const sorted = seqs("SORTED BY", Field);

    const range = seqs(optPrios(seqs("FROM", Source)),
                       optPrios(seqs("TO", Source)));

    const src = alts(ver(Version.v740sp02, new Source()), SimpleSource);

    return seqs("APPEND",
                altPrios("INITIAL LINE", seqs(optPrios("LINES OF"), src)),
                opts(range),
                optPrios(seqs("TO", Target)),
                opts(altPrios(assigning, reference)),
                optPrios("CASTING"),
                optPrios(sorted));
  }

}