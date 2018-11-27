import * as Statements from "../abap/statements";
import {IFile} from "../files/_ifile";
import {Position} from "../position";
import {MethodName} from "../abap/expressions";
import {StatementNode} from "../abap/nodes";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {Empty, Comment} from "../abap/statements/_statement";


export interface IMethodLengthResult {
  name: string;
  count: number;
  file: IFile;
  pos: Position;
}

export class MethodLengthStats {
  public static run(obj: IObject): IMethodLengthResult[] {
    const res: IMethodLengthResult[] = [];
    let pos: Position | undefined = undefined;
    let name: string = "";
    let count = 0;
    let method: boolean = false;

    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    for (const file of (obj as ABAPObject).getParsedFiles()) {
      for (const stat of file.getStatements()) {
        const type = stat.get();
        if (type instanceof Statements.Method) {
          pos = stat.getFirstToken().get().getPos();
          name = this.findName(stat);
          method = true;
          count = 0;
        } else if (type instanceof Statements.EndMethod) {
          if (pos) {
            res.push({name, count, file, pos});
          } else {
            throw new Error("MethodLength, expected pos to be defined");
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
      name = nameExpr.getFirstToken().get().getStr();
    } else {
      throw new Error("MethodLength, findName, expected MethodName");
    }
    return name;
  }
}