import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";

export class Window extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("WINDOW STARTING AT"),
               new Source(),
               new Source(),
               str("ENDING AT"),
               new Source(),
               new Source());
  }

}