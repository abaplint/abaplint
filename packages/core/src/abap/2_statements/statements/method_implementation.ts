import {IStatement} from "./_statement";
import {seq, opt, optPrio, alt, plus, altPrio, regex as reg} from "../combi";
import {MethodName, Language, SimpleFieldChain} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class MethodImplementation implements IStatement {

  public getMatcher(): IStatementRunnable {
    const name = reg(/[\w~]+/);

    const kernel = seq("KERNEL MODULE",
                       plus(name),
                       optPrio(altPrio("FAIL", "IGNORE")));

    const using = seq("USING", plus(SimpleFieldChain));

    const database = seq("DATABASE", alt("PROCEDURE", "FUNCTION", "GRAPH WORKSPACE"), "FOR HDB",
                         Language,
                         opt("OPTIONS READ-ONLY"),
                         opt(using));

    const by = seq("BY", alt(kernel, database));

    return seq("METHOD", MethodName, optPrio(by));
  }

}