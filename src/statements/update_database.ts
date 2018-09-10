import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, alt, IRunnable} from "../combi";

export class UpdateDatabase extends Statement {

  public static get_matcher(): IRunnable {
    let target = alt(new Reuse.DatabaseTable(), new Reuse.Dynamic());

    let set = seq(str("SET"),
                  alt(new Reuse.ParameterListS(), new Reuse.Dynamic()),
                  opt(seq(str("WHERE"), new Reuse.SQLCond())));

    let fromTable = seq(str("FROM"),
                        opt(str("TABLE")),
                        new Reuse.Source());

    let client = str("CLIENT SPECIFIED");

    let ret = seq(str("UPDATE"),
                  target,
                  opt(client),
                  opt(alt(fromTable, set)));

    return ret;
  }

}