import {IStatement} from "./_statement";
import {verNot, seqs, opts, alts} from "../combi";
import * as Expressions from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class IncludeType implements IStatement {

  public getMatcher(): IStatementRunnable {
    const tas = seqs("AS", Expressions.Field);

    const renaming = seqs("RENAMING WITH SUFFIX", Expressions.Source);

    const ret = seqs("INCLUDE",
                     alts("TYPE", "STRUCTURE"),
                     Expressions.TypeName,
                     opts(tas),
                     opts(renaming));

    return verNot(Version.Cloud, ret);
  }

}