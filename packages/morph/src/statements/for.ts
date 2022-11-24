import {ForStatement} from "ts-morph";
import {handleExpression} from "../expressions";
import {handleStatement} from "../statements";

export class MorphFor {
  public run(s: ForStatement) {

    const initializer = handleExpression(s.getInitializer());
    const condition = handleExpression(s.getCondition());
    const incrementor = handleExpression(s.getIncrementor());

    let ret = "";
    if (initializer === "" && condition === "" && incrementor === "") {
      ret += "DO.\n";
      ret += handleStatement(s.getStatement());
      ret += "ENDDO.\n";
    } else {
      ret += initializer;
      ret += "WHILE " + condition + ".\n";
      ret += incrementor + ".\n";
      ret += handleStatement(s.getStatement());
      ret += "ENDWHILE.\n";
    }

    return ret;
  }
}