import {Statement} from "./_statement";
import {str, seq, opt, alt, regex as reg, IStatementRunnable} from "../combi";
import {MethodName} from "../expressions";

export class Method extends Statement {

  public getMatcher(): IStatementRunnable {
    const name = reg(/[\w~]+/);

    const kernel = seq(str("BY KERNEL MODULE"),
                       name,
                       opt(alt(str("FAIL"), str("IGNORE"))));

    return seq(str("METHOD"), new MethodName(), opt(kernel));
  }

}