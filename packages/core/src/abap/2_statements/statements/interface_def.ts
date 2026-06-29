import {IStatement} from "./_statement";
import {Release} from "../../../version";
import {seq, opt, alt, ver, plus, AlsoIn} from "../combi";
import {Source, InterfaceName, AttributeName, AbstractMethods, FinalMethods} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class InterfaceDef implements IStatement {

  public getMatcher(): IStatementRunnable {
    const val = seq(AttributeName, "=", Source);

    const dataValues = seq("DATA VALUES", plus(val));

    const options = alt(seq(AbstractMethods, opt(FinalMethods)),
                        FinalMethods,
                        "ALL METHODS ABSTRACT",
                        "ALL METHODS FINAL",
                        ver(Release.v740sp02, "PARTIALLY IMPLEMENTED", {also: AlsoIn.OpenABAP}));

    return seq("INTERFACES",
               InterfaceName,
               opt(options),
               opt(dataValues));
  }

}