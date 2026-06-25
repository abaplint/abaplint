import {IStatement} from "./_statement";
import {verNotLang, seq, tok, opt} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Source, SimpleName, NamespaceSimpleName} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class DeleteCluster implements IStatement {

  public getMatcher(): IStatementRunnable {
    const client = seq("CLIENT", Source);

    const ret = seq("DELETE FROM DATABASE",
                    NamespaceSimpleName,
                    tok(ParenLeft),
                    SimpleName,
                    tok(ParenRightW),
                    opt(client),
                    "ID",
                    Source);

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
