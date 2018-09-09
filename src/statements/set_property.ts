import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {seq, str, IRunnable} from "../combi";

export class SetProperty extends Statement {

  public static get_matcher(): IRunnable {

    let ret = seq(str("SET PROPERTY OF"),
                  new Reuse.Source(),
                  new Reuse.Constant,
                  str("="),
                  new Reuse.Source());

    return ret;
  }

}