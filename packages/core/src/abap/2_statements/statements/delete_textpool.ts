import {IStatement} from "./_statement";
import {verNot, seqs, opt} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class DeleteTextpool implements IStatement {

  public getMatcher(): IStatementRunnable {
    const language = seqs("LANGUAGE", Source);
    const state = seqs("STATE", Source);

    const ret = seqs("DELETE TEXTPOOL",
                     Source,
                     opt(language),
                     opt(state));

    return verNot(Version.Cloud, ret);
  }

}