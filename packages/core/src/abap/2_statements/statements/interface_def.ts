import {IStatement} from "./_statement";
import {Version} from "../../../version";
import {seq, opts, alts, vers, pluss} from "../combi";
import {Source, InterfaceName, AttributeName, AbstractMethods, FinalMethods} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class InterfaceDef implements IStatement {

  public getMatcher(): IStatementRunnable {
    const val = seq(AttributeName, "=", Source);

    const dataValues = seq("DATA VALUES", pluss(val));

    const options = alts(AbstractMethods,
                         FinalMethods,
                         "ALL METHODS ABSTRACT",
                         "ALL METHODS FINAL",
                         vers(Version.v740sp02, "PARTIALLY IMPLEMENTED"));

    return seq("INTERFACES",
               InterfaceName,
               opts(options),
               opts(dataValues));
  }

}