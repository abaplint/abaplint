import {IStatement} from "./_statement";
import {Version} from "../../../version";
import {seq, opt, alt, ver, plus} from "../combi";
import {Source, InterfaceName, AttributeName, AbstractMethods, FinalMethods} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class InterfaceDef implements IStatement {

  public getMatcher(): IStatementRunnable {
    const val = seq(AttributeName, "=", Source);

    const dataValues = seq("DATA VALUES", plus(val));

    const options = alt(AbstractMethods,
                        FinalMethods,
                        "ALL METHODS ABSTRACT",
                        "ALL METHODS FINAL",
                        ver(Version.v740sp02, "PARTIALLY IMPLEMENTED"));

    return seq("INTERFACES",
               InterfaceName,
               opt(options),
               opt(dataValues));
  }

}