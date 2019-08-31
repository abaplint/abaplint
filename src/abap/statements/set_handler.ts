import {Statement} from "./_statement";
import {str, seq, opt, alt, plus, IStatementRunnable} from "../combi";
import {Source, MethodName, ArrowOrDash, SimpleName} from "../expressions";

export class SetHandler extends Statement {

  public getMatcher(): IStatementRunnable {
    const activation = seq(str("ACTIVATION"), new Source());

    const fo = seq(str("FOR"), alt(str("ALL INSTANCES"), new Source()));

// todo, this is not super correct
    const method = seq(opt(seq(new SimpleName(), new ArrowOrDash())), new MethodName());

    const ret = seq(str("SET HANDLER"),
                    plus(method),
                    opt(fo),
                    opt(activation));

    return ret;
  }

}