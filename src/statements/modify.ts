import {Statement} from "./statement";
import {str, seq, opt, alt, per, plus, IRunnable} from "../combi";
import {FSTarget, Target, Source, Dynamic, Cond, FieldSub} from "../expressions";

export class Modify extends Statement {

  public static get_matcher(): IRunnable {
    let index = seq(str("INDEX"), new Source());
    let from = seq(str("FROM"), opt(str("TABLE")), new Source());
    let transporting = seq(str("TRANSPORTING"),
                           plus(alt(new FieldSub(), new Dynamic())));
    let where = seq(str("WHERE"), new Cond());
    let client = str("CLIENT SPECIFIED");
    let assigning = seq(str("ASSIGNING"), new FSTarget());

    let target = seq(opt(str("TABLE")), alt(new Target(), new Dynamic()));

    let conn = seq(str("CONNECTION"), new Dynamic());

    let options = per(conn, from, index, transporting, where, client, assigning);

    return seq(str("MODIFY"), target, opt(options));
  }

}