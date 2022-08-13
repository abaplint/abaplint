import {IStatement} from "./_statement";
import {seq, alt, opt, per, optPrio, altPrio} from "../combi";
import {FSTarget, Target, Source, Dynamic, TypeName, AssignSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Assign implements IStatement {

  public getMatcher(): IStatementRunnable {


    const type = seq("TYPE", alt(Dynamic, TypeName));
    const like = seq("LIKE", alt(Dynamic, Source));
    const handle = seq("TYPE HANDLE", Source);
    const range = seq("RANGE", Source);
    const decimals = seq("DECIMALS", Source);

    const casting = seq("CASTING", opt(alt(like, handle, per(type, decimals))));
    const obsoleteType = seq("TYPE", Source, optPrio(decimals));

    const ret = seq("ASSIGN",
                    opt(seq(Target, "INCREMENT")),
                    AssignSource,
                    "TO",
                    FSTarget,
                    opt(altPrio(casting, obsoleteType)),
                    opt(range));

    return ret;
  }

}