import {IStatement} from "./_statement";
import {seqs, opts, optPrio, alts, plus, altPrios, regex as reg} from "../combi";
import {MethodName, Language} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Method implements IStatement {

  public getMatcher(): IStatementRunnable {
    const name = reg(/[\w~]+/);

    const kernel = seqs("KERNEL MODULE",
                        plus(name),
                        optPrio(altPrios("FAIL", "IGNORE")));

    const using = seqs("USING", plus(name));

    const database = seqs("DATABASE", alts("PROCEDURE", "FUNCTION"), "FOR HDB",
                          Language,
                          opts("OPTIONS READ-ONLY"),
                          opts(using));

    const by = seqs("BY", alts(kernel, database));

    return seqs("METHOD", MethodName, optPrio(by));
  }

}