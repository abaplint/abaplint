import {Statement} from "./statement";
import {str, seq, opt, alt, IRunnable} from "../combi";
import {Source, DatabaseTable, Dynamic, ParameterListS, SQLCond} from "../expressions";

export class UpdateDatabase extends Statement {

  public static get_matcher(): IRunnable {
    let target = alt(new DatabaseTable(), new Dynamic());

    let set = seq(str("SET"),
                  alt(new ParameterListS(), new Dynamic()),
                  opt(seq(str("WHERE"), new SQLCond())));

    let fromTable = seq(str("FROM"),
                        opt(str("TABLE")),
                        new Source());

    let client = str("CLIENT SPECIFIED");

    let ret = seq(str("UPDATE"),
                  target,
                  opt(client),
                  opt(alt(fromTable, set)));

    return ret;
  }

}