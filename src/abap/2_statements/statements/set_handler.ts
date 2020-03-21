import {IStatement} from "./_statement";
import {str, seq, opt, alt, plus, IStatementRunnable} from "../combi";
import {Source, MethodSource} from "../expressions";

export class SetHandler implements IStatement {

  public getMatcher(): IStatementRunnable {
    const activation = seq(str("ACTIVATION"), new Source());

    const fo = seq(str("FOR"), alt(str("ALL INSTANCES"), new Source()));

    const ret = seq(str("SET HANDLER"),
                    plus(new MethodSource()),
                    opt(fo),
                    opt(activation));

    return ret;
  }

}