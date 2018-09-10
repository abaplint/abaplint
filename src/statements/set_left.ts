import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class SetLeft extends Statement {

  public static get_matcher(): IRunnable {
    return str("SET LEFT SCROLL-BOUNDARY");
  }

}