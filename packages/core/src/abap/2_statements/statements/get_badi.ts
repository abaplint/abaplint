import {IStatement} from "./_statement";
import {verNot, seq, opts} from "../combi";
import {Target, ParameterListS, Source, Dynamic} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetBadi implements IStatement {

  public getMatcher(): IStatementRunnable {
    const filters = seq("FILTERS", ParameterListS);
    const context = seq("CONTEXT", Source);
    const type = seq("TYPE", Dynamic);

    const ret = seq("GET BADI",
                    Target,
                    opts(type),
                    opts(filters),
                    opts(context));

    return verNot(Version.Cloud, ret);
  }

}