import {IStatement} from "./_statement";
import {verNot, seq, opts, alt} from "../combi";
import * as Expressions from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class IncludeType implements IStatement {

  public getMatcher(): IStatementRunnable {
    const tas = seq("AS", Expressions.Field);

    const renaming = seq("RENAMING WITH SUFFIX", Expressions.Source);

    const ret = seq("INCLUDE",
                    alt("TYPE", "STRUCTURE"),
                    Expressions.TypeName,
                    opts(tas),
                    opts(renaming));

    return verNot(Version.Cloud, ret);
  }

}