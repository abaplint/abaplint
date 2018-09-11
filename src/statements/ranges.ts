import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Source, SimpleName, FieldSub} from "../expressions";

export class Ranges extends Statement {

  public static get_matcher(): IRunnable {
    let occurs = seq(str("OCCURS"), new Source());

    return seq(str("RANGES"),
               new SimpleName(),
               str("FOR"),
               new FieldSub(),
               opt(occurs));
  }

}