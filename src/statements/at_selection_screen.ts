import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;

export class AtSelectionScreen extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let output = str("OUTPUT");
    let value = seq(str("ON VALUE-REQUEST FOR"), Reuse.field());
    let exit = str("ON EXIT-COMMAND");
    let ret = seq(str("AT SELECTION-SCREEN"), alt(output, value, exit));

    return ret;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new AtSelectionScreen(tokens);
    }
    return undefined;
  }

}