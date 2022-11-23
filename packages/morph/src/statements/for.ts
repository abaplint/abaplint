import {ForStatement} from "ts-morph";
import {handleStatement} from "../statements";

export class MorphFor {
  public run(s: ForStatement) {
    if (s.getText().startsWith("for (;;) {") === false) {
      console.dir("todo, MorphFor");
    }

    let ret = "DO.\n";
    ret += handleStatement(s.getStatement());
    ret += "ENDDO.\n";
    return ret;
  }
}