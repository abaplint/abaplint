import {IStatement} from "./_statement";
import {verNot, seqs, opt} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class InsertTextpool implements IStatement {

  public getMatcher(): IStatementRunnable {
    const state = seqs("STATE", Source);
    const language = seqs("LANGUAGE", Source);

    const ret = seqs("INSERT TEXTPOOL",
                     Source,
                     "FROM",
                     Source,
                     opt(language),
                     opt(state));

    return verNot(Version.Cloud, ret);
  }

}