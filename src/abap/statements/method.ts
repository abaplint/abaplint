import {Statement} from "./_statement";
import {str, seq, opt, alt, regex as reg, IStatementRunnable} from "../combi";
import {MethodName, Language} from "../expressions";

export class Method extends Statement {

  public getMatcher(): IStatementRunnable {
    const name = reg(/[\w~]+/);

    const kernel = seq(str("KERNEL MODULE"),
                       name,
                       opt(alt(str("FAIL"), str("IGNORE"))));

    const database = seq(str("DATABASE PROCEDURE FOR HDB"), new Language());

    const by = seq(str("BY"), alt(kernel, database));

    return seq(str("METHOD"), new MethodName(), opt(by));
  }

}