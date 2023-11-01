import {ClassDeclaration, NewExpression} from "ts-morph";
import {handleExpression} from "../expressions";
import {MorphSettings} from "../statements";
import {mapName} from "../map_name";

export class MorphNew {
  public run(s: NewExpression, settings: MorphSettings) {
    const name = s.getType().getSymbol()?.getName();

/*
    console.dir(s.getTypeArguments());
    console.dir(s.getType().getCallSignatures());
    console.dir(s.getType().getConstructSignatures());
*/

    const val = s.getType().getSymbol()?.getValueDeclaration();
    let parameterNames: string[] = [];
    if (val instanceof ClassDeclaration) {
      parameterNames = val.getConstructors()[0]?.getParameters().map(p => p.getName()).reverse() || [];
    }
    if (parameterNames.length === 0) {
      parameterNames = s.getType().compilerType.getProperties().map(p => p.escapedName.toString()).reverse();
    }

    let ret = `NEW ${mapName(name, settings)}(`;
    const args = s.getArguments().reverse();
    while (args.length > 0) {
      ret += " " + parameterNames.pop() + " = " + handleExpression(args.pop(), settings);
    }

    return ret + ` )`;
  }
}