import {IStatement} from "./_statement";
import {str, seq, opt, optPrio, alt, plus, regex as reg, IStatementRunnable} from "../combi";
import {MethodName, Language} from "../expressions";

export class Method implements IStatement {

  public getMatcher(): IStatementRunnable {
    const name = reg(/[\w~]+/);

    const kernel = seq(str("KERNEL MODULE"),
                       plus(name),
                       optPrio(alt(str("FAIL"), str("IGNORE"))));

    const using = seq(str("USING"), plus(name));

    const database = seq(str("DATABASE"), alt(str("PROCEDURE"), str("FUNCTION")), str("FOR HDB"),
                         new Language(),
                         opt(str("OPTIONS READ-ONLY")),
                         opt(using));

    const by = seq(str("BY"), alt(kernel, database));

    return seq(str("METHOD"), new MethodName(), opt(by));
  }

}