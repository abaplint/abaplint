import {IStatement} from "./_statement";
import {Version} from "../../../version";
import {str, seqs, opts, alts, ver, plus} from "../combi";
import {Source, InterfaceName, AttributeName, AbstractMethods, FinalMethods} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class InterfaceDef implements IStatement {

  public getMatcher(): IStatementRunnable {
    const val = seqs(AttributeName, "=", Source);

    const dataValues = seqs("DATA VALUES",
                            plus(val));

    const options = alts(AbstractMethods,
                         FinalMethods,
                         "ALL METHODS ABSTRACT",
                         "ALL METHODS FINAL",
                         ver(Version.v740sp02, str("PARTIALLY IMPLEMENTED")));

    return seqs("INTERFACES",
                InterfaceName,
                opts(options),
                opts(dataValues));
  }

}