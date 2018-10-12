import {Statement} from "./statement";
import {str, seq, star, IRunnable} from "../combi";
import {Source} from "../expressions";

export class When extends Statement {

  public get_matcher(): IRunnable {
    return seq(str("WHEN"),
               new Source(),
               star(seq(str("OR"), new Source())));
  }

}