import {Statement} from "./statement";
import {str, seq, star, IRunnable} from "../combi";
import {Source} from "../expressions";

export class When extends Statement {

  public getMatcher(): IRunnable {
    return seq(str("WHEN"),
               new Source(),
               star(seq(str("OR"), new Source())));
  }

}