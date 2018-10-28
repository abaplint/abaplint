import {Statement} from "./statement";
import {IRunnable} from "../combi";
import {seq, opt} from "../combi";
import {Select as eSelect, SQLHints} from "../expressions";

export class Select extends Statement {

  public getMatcher(): IRunnable {
    return seq(new eSelect(), opt(new SQLHints()));
  }

}