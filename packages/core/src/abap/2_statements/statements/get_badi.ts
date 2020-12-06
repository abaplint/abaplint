import {IStatement} from "./_statement";
import {verNot, seqs, opts} from "../combi";
import {Target, ParameterListS, Source, Dynamic} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetBadi implements IStatement {

  public getMatcher(): IStatementRunnable {
    const filters = seqs("FILTERS", ParameterListS);
    const context = seqs("CONTEXT", Source);
    const type = seqs("TYPE", Dynamic);

    const ret = seqs("GET BADI",
                     Target,
                     opts(type),
                     opts(filters),
                     opts(context));

    return verNot(Version.Cloud, ret);
  }

}