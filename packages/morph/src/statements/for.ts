import {ForStatement} from "ts-morph";
import {handleExpression} from "../expressions";
import {MorphSettings, handleStatement} from "../statements";

export class MorphFor {
  public run(s: ForStatement, settings: MorphSettings) {

    const initializer = handleExpression(s.getInitializer(), settings);
    const condition = handleExpression(s.getCondition(), settings);
    const incrementor = handleExpression(s.getIncrementor(), settings);

    let ret = "";
    if (initializer === "" && condition === "" && incrementor === "") {
      ret += "DO.\n";
      ret += handleStatement(s.getStatement(), settings);
      ret += "ENDDO.\n";
    } else {
      ret += initializer;
      ret += "WHILE " + condition + ".\n";
      ret += handleStatement(s.getStatement(), settings);
      ret += incrementor + ".\n";
      ret += "ENDWHILE.\n";
    }

    return ret;
  }
}