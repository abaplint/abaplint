import {IStatement} from "./_statement";
import {str, seqs, opt, optPrio, alts, plus, altPrio, regex as reg} from "../combi";
import {MethodName, Language} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Method implements IStatement {

  public getMatcher(): IStatementRunnable {
    const name = reg(/[\w~]+/);

    const kernel = seqs("KERNEL MODULE",
                        plus(name),
                        optPrio(altPrio(str("FAIL"), str("IGNORE"))));

    const using = seqs("USING", plus(name));

    const database = seqs("DATABASE", alts("PROCEDURE", "FUNCTION"), "FOR HDB",
                          Language,
                          opt(str("OPTIONS READ-ONLY")),
                          opt(using));

    const by = seqs("BY", alts(kernel, database));

    return seqs("METHOD", MethodName, optPrio(by));
  }

}