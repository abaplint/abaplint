import {Statement} from "./statement";
import {verNot, str, seq, tok, IRunnable} from "../combi";
import {ParenLeft, ParenRightW} from "../tokens/";
import {Source, SimpleName} from "../expressions";
import {Version} from "../version";

export class DeleteCluster extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("DELETE FROM DATABASE"),
                  new SimpleName(),
                  tok(ParenLeft),
                  new SimpleName(),
                  tok(ParenRightW),
                  str("ID"),
                  new Source());

    return verNot(Version.Cloud, ret);
  }

}