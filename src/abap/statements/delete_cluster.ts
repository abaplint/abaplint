import {Statement} from "./_statement";
import {verNot, str, seq, tok, opt, IRunnable} from "../combi";
import {ParenLeft, ParenRightW} from "../tokens/";
import {Source, SimpleName} from "../expressions";
import {Version} from "../../version";

export class DeleteCluster extends Statement {

  public getMatcher(): IRunnable {
    const client = seq(str("CLIENT"), new Source());

    const ret = seq(str("DELETE FROM DATABASE"),
                    new SimpleName(),
                    tok(ParenLeft),
                    new SimpleName(),
                    tok(ParenRightW),
                    opt(client),
                    str("ID"),
                    new Source());

    return verNot(Version.Cloud, ret);
  }

}