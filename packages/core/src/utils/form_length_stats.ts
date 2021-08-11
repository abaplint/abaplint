import * as Statements from "../abap/2_statements/statements";
import {Position} from "../position";
import {FormName} from "../abap/2_statements/expressions";
import {StatementNode} from "../abap/nodes";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {Empty, Comment} from "../abap/2_statements/statements/_statement";
import {IMethodLengthResult} from "./method_length_stats";

export class FormLengthStats {
  public static run(obj: IObject): IMethodLengthResult[] {
    const res: IMethodLengthResult[] = [];
    let pos: Position | undefined = undefined;
    let name: string = "";
    let count = 0;
    let form: boolean = false;

    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    for (const file of obj.getABAPFiles()) {
      for (const stat of file.getStatements()) {
        const type = stat.get();
        if (type instanceof Statements.Form) {
          pos = stat.getFirstToken().getStart();
          name = this.findName(stat);
          form = true;
          count = 0;
        } else if (type instanceof Statements.EndForm) {
          if (pos) {
            res.push({name, count, file, pos});
          } else {
            continue;
          }
          form = false;
        } else if (form === true
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
    const nameExpr = stat.findFirstExpression(FormName);
    if (nameExpr) {
      name = nameExpr.getFirstToken().getStr();
    } else {
      throw new Error("FormLength, findName, expected FormName");
    }
    return name;
  }
}