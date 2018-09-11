import {Statement} from "./statement";
import {seq, str, IRunnable} from "../combi";
import {Source, Constant} from "../expressions";

export class SetProperty extends Statement {

  public static get_matcher(): IRunnable {

    let ret = seq(str("SET PROPERTY OF"),
                  new Source(),
                  new Constant,
                  str("="),
                  new Source());

    return ret;
  }

}