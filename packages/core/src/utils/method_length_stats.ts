import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Position} from "../position";
import {MethodName} from "../abap/2_statements/expressions";
import {StatementNode} from "../abap/nodes";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {Empty, Comment} from "../abap/2_statements/statements/_statement";
import {ABAPFile} from "../abap/abap_file";

export interface IMethodLengthResult {
  className: string;
  name: string;
  count: number;
  file: ABAPFile;
  pos: Position;
}

export class MethodLengthStats {
  public static run(obj: IObject): IMethodLengthResult[] {
    const res: IMethodLengthResult[] = [];
    let pos: Position | undefined = undefined;
    let methodName: string = "";
    let count = 0;
    let method: boolean = false;

    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    for (const file of obj.getABAPFiles()) {
      let className = "";
      for (const stat of file.getStatements()) {
        const type = stat.get();
        if (type instanceof Statements.MethodImplementation) {
          pos = stat.getFirstToken().getStart();
          methodName = this.findName(stat);
          method = true;
          count = 0;
        } else if (type instanceof Statements.ClassImplementation) {
          className = stat.findFirstExpression(Expressions.ClassName)?.concatTokens() || "INTERNAL_ERROR";
        } else if (type instanceof Statements.EndMethod) {
          if (pos) {
            res.push({name: methodName, className, count, file, pos});
          } else {
            continue;
          }
          method = false;
        } else if (method === true
            && !(type instanceof Comment)
            && !(type instanceof Empty)) {
          count = count + 1;
        }
      }
    }

    return res;
  }

  private static findName(stat: StatementNode): string {
    let name: string = "";
    const nameExpr = stat.findFirstExpression(MethodName);
    if (nameExpr) {
      name = nameExpr.getFirstToken().getStr();
    } else {
      throw new Error("MethodLength, findName, expected MethodName");
    }
    return name;
  }
}