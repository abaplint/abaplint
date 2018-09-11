import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";

export class DeleteDynpro extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("DELETE DYNPRO"),
               new Source());
  }

}