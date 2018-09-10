import {Statement} from "./statement";
import {str, seq, opt, alt, IRunnable} from "../combi";

export class NewLine extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("NEW-LINE"),
               opt(alt(str("SCROLLING"), str("NO-SCROLLING"))));
  }

}