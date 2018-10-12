import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class Public extends Statement {

  public get_matcher(): IRunnable {
    return str("PUBLIC SECTION");
  }

}