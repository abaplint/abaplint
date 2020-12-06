import {IStatement} from "./_statement";
import {verNot, seq, opt} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class InsertTextpool implements IStatement {

  public getMatcher(): IStatementRunnable {
    const state = seq("STATE", Source);
    const language = seq("LANGUAGE", Source);

    const ret = seq("INSERT TEXTPOOL",
                    Source,
                    "FROM",
                    Source,
                    opt(language),
                    opt(state));

    return verNot(Version.Cloud, ret);
  }

}