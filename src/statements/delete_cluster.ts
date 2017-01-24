import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";
import {ParenLeft, ParenRightW} from "../tokens/";

let str = Combi.str;
let seq = Combi.seq;
let tok = Combi.tok;

export class DeleteCluster extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("DELETE FROM DATABASE"),
               new Reuse.SimpleName(),
               tok(ParenLeft),
               new Reuse.SimpleName(),
               tok(ParenRightW),
               str("ID"),
               new Reuse.Source());
  }

}