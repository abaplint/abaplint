import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class EditorCall extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("EDITOR-CALL FOR"),
               new Reuse.Source(),
               str("DISPLAY-MODE"),
               str("TITLE"),
               new Reuse.Source());
  }

}