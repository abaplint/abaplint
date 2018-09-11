import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";

export class ExportDynpro extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("EXPORT DYNPRO"),
               new Source(),
               new Source(),
               new Source(),
               new Source(),
               str("ID"),
               new Source());
  }

}