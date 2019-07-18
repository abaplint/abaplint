import {Statement} from "./_statement";
import {str, seq, opt, alt, plus, IStatementRunnable} from "../combi";
import {Source, Target} from "../expressions";

export class SetHandler extends Statement {

  public getMatcher(): IStatementRunnable {
    const activation = seq(str("ACTIVATION"), new Source());

    const fo = seq(str("FOR"), alt(str("ALL INSTANCES"), new Source()));

    const ret = seq(str("SET HANDLER"),
// todo, this should be something with MethodName instead
                    plus(new Target()),
                    opt(fo),
                    opt(activation));

    return ret;
  }

}