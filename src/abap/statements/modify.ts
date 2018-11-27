import {Statement} from "./_statement";
import {str, seq, opt, alt, per, plus, IStatementRunnable} from "../combi";
import {FSTarget, Target, Source, Dynamic, Cond, FieldSub} from "../expressions";

export class Modify extends Statement {

  public getMatcher(): IStatementRunnable {
    const index = seq(str("INDEX"), new Source());
    const from = seq(str("FROM"), opt(str("TABLE")), new Source());
    const transporting = seq(str("TRANSPORTING"),
                             plus(alt(new FieldSub(), new Dynamic())));
    const where = seq(str("WHERE"), new Cond());
    const client = str("CLIENT SPECIFIED");
    const assigning = seq(str("ASSIGNING"), new FSTarget());

    const target = seq(opt(str("TABLE")), alt(new Target(), new Dynamic()));

    const conn = seq(str("CONNECTION"), alt(new Dynamic(), new Source()));

    const options = per(conn, from, index, transporting, where, client, assigning);

    return seq(str("MODIFY"), target, opt(options));
  }

}