import {IStatement} from "./_statement";
import {verNot, seqs, tok, opt} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Source, SimpleName, NamespaceSimpleName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class DeleteCluster implements IStatement {

  public getMatcher(): IStatementRunnable {
    const client = seqs("CLIENT", Source);

    const ret = seqs("DELETE FROM DATABASE",
                     NamespaceSimpleName,
                     tok(ParenLeft),
                     SimpleName,
                     tok(ParenRightW),
                     opt(client),
                     "ID",
                     Source);

    return verNot(Version.Cloud, ret);
  }

}