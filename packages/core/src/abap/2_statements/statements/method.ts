import {IStatement} from "./_statement";
import {seq, opts, optPrios, alt, pluss, altPrio, regex as reg} from "../combi";
import {MethodName, Language} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Method implements IStatement {

  public getMatcher(): IStatementRunnable {
    const name = reg(/[\w~]+/);

    const kernel = seq("KERNEL MODULE",
                       pluss(name),
                       optPrios(altPrio("FAIL", "IGNORE")));

    const using = seq("USING", pluss(name));

    const database = seq("DATABASE", alt("PROCEDURE", "FUNCTION"), "FOR HDB",
                         Language,
                         opts("OPTIONS READ-ONLY"),
                         opts(using));

    const by = seq("BY", alt(kernel, database));

    return seq("METHOD", MethodName, optPrios(by));
  }

}