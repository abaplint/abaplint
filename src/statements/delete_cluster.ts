import {Statement} from "./statement";
import {str, seq, tok, IRunnable} from "../combi";
import {ParenLeft, ParenRightW} from "../tokens/";
import {Source, SimpleName} from "../expressions";

export class DeleteCluster extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("DELETE FROM DATABASE"),
               new SimpleName(),
               tok(ParenLeft),
               new SimpleName(),
               tok(ParenRightW),
               str("ID"),
               new Source());
  }

}