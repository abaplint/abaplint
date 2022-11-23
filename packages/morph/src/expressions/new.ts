import {ClassDeclaration, NewExpression} from "ts-morph";
import {handleExpression} from "../expressions";

export class MorphNew {
  public run(s: NewExpression) {
    const name = s.getType().getSymbol()?.getName();

    const val = s.getType().getSymbol()?.getValueDeclaration();
    let parameterNames: string[] = [];
    if (val instanceof ClassDeclaration) {
      parameterNames = val.getConstructors()[0]?.getParameters().map(p => p.getName()) || [];
    }

    let ret = `NEW ${name}(`;
    const args = s.getArguments();
    while (args.length > 0) {
      ret += " " + parameterNames.pop() + " = " + handleExpression(args.pop());
    }

    return ret + ` )`;
  }
}