import {IStatement} from "./_statement";
import {seq, opts, optPrios, alts, pluss, altPrios, regex as reg} from "../combi";
import {MethodName, Language} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Method implements IStatement {

  public getMatcher(): IStatementRunnable {
    const name = reg(/[\w~]+/);

    const kernel = seq("KERNEL MODULE",
                       pluss(name),
                       optPrios(altPrios("FAIL", "IGNORE")));

    const using = seq("USING", pluss(name));

    const database = seq("DATABASE", alts("PROCEDURE", "FUNCTION"), "FOR HDB",
                         Language,
                         opts("OPTIONS READ-ONLY"),
                         opts(using));

    const by = seq("BY", alts(kernel, database));

    return seq("METHOD", MethodName, optPrios(by));
  }

}