import {Statement} from "./statement";
import {str, seq, tok, IRunnable} from "../combi";
import * as Reuse from "./reuse";
import {ParenLeft, ParenRightW} from "../tokens/";

export class DeleteCluster extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("DELETE FROM DATABASE"),
               new Reuse.SimpleName(),
               tok(ParenLeft),
               new Reuse.SimpleName(),
               tok(ParenRightW),
               str("ID"),
               new Reuse.Source());
  }

}