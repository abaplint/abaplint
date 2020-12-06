import {IStatement} from "./_statement";
import {Version} from "../../../version";
import {seqs, opts, alts, vers, pluss} from "../combi";
import {Source, InterfaceName, AttributeName, AbstractMethods, FinalMethods} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class InterfaceDef implements IStatement {

  public getMatcher(): IStatementRunnable {
    const val = seqs(AttributeName, "=", Source);

    const dataValues = seqs("DATA VALUES", pluss(val));

    const options = alts(AbstractMethods,
                         FinalMethods,
                         "ALL METHODS ABSTRACT",
                         "ALL METHODS FINAL",
                         vers(Version.v740sp02, "PARTIALLY IMPLEMENTED"));

    return seqs("INTERFACES",
                InterfaceName,
                opts(options),
                opts(dataValues));
  }

}