import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Position} from "../position";
import {StatementNode} from "../abap/nodes";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {Empty, Comment} from "../abap/2_statements/statements/_statement";
import {IMethodLengthResult} from "./method_length_stats";

export class FunctionLengthStats {
  public static run(obj: IObject): IMethodLengthResult[] {
    const res: IMethodLengthResult[] = [];
    let pos: Position | undefined = undefined;
    let name: string = "";
    let count = 0;
    let func: boolean = false;

    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    for (const file of obj.getABAPFiles()) {
      for (const stat of file.getStatements()) {
        const type = stat.get();
        if (type instanceof Statements.FunctionModule) {
          pos = stat.getFirstToken().getStart();
          name = this.findName(stat);
          func = true;
          count = 0;
        } else if (type instanceof Statements.EndFunction) {
          if (pos) {
            res.push({name: name, className: "", count, file, pos});
          } else {
            continue;
          }
          func = false;
        } else if (func === true
            && !(type instanceof Comment)
            && !(type instanceof Empty)) {
          count = count + 1;
        }
      }
    }

    return res;
  }

  private static findName(stat: StatementNode): string {
    const nameExpr = stat.findFirstExpression(Expressions.Field);
    if (nameExpr) {
      return nameExpr.getFirstToken().getStr();
    } else {
      throw new Error("FunctionLength, findName, expected Field");
    }
  }
}
