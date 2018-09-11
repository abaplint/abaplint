import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";

export class DeleteDataset extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("DELETE DATASET"), new Source());
  }

}