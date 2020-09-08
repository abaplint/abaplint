import {IStatement} from "./_statement";
import {Version} from "../../../version";
import {str, seq, opt, alt, ver, plus} from "../combi";
import {Source, InterfaceName, AttributeName, AbstractMethods, FinalMethods} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class InterfaceDef implements IStatement {

  public getMatcher(): IStatementRunnable {
    const val = seq(new AttributeName(), str("="), new Source());

    const dataValues = seq(str("DATA VALUES"),
                           plus(val));

    const options = alt(new AbstractMethods(),
                        new FinalMethods(),
                        str("ALL METHODS ABSTRACT"),
                        str("ALL METHODS FINAL"),
                        ver(Version.v740sp02, str("PARTIALLY IMPLEMENTED")));

    return seq(str("INTERFACES"),
               new InterfaceName(),
               opt(options),
               opt(dataValues));
  }

}