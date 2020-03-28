import {IStatement} from "./_statement";
import {verNot, str, seq, tok, opt} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Source, SimpleName, NamespaceSimpleName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class DeleteCluster implements IStatement {

  public getMatcher(): IStatementRunnable {
    const client = seq(str("CLIENT"), new Source());

    const ret = seq(str("DELETE FROM DATABASE"),
                    new NamespaceSimpleName(),
                    tok(ParenLeft),
                    new SimpleName(),
                    tok(ParenRightW),
                    opt(client),
                    str("ID"),
                    new Source());

    return verNot(Version.Cloud, ret);
  }

}