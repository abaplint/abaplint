import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {IFile} from "../files/_ifile";
import {Position} from "../position";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";

// only methods are reported

export interface ICyclomaticComplexityResult {
  file: IFile;
  pos: Position;
  name: string;
  count: number;
}

export class CyclomaticComplexityStats {

  public static run(obj: IObject): ICyclomaticComplexityResult[] {
    const res: ICyclomaticComplexityResult[] = [];

    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    for (const file of obj.getABAPFiles()) {
      for (const m of file.getStructure()?.findAllStructures(Structures.Method) || []) {
        let count = 0;
        for (const s of m.findAllStatementNodes()) {
          const type = s.get();
          if (type instanceof Statements.Assert
              || type instanceof Statements.Check
              || type instanceof Statements.ElseIf
              || type instanceof Statements.If
              || type instanceof Statements.While
              || type instanceof Statements.Case
              || type instanceof Statements.SelectLoop
              || type instanceof Statements.Catch
              || type instanceof Statements.Cleanup
              || type instanceof Statements.EndAt
              || type instanceof Statements.Loop) {
            count += 1;
          }
        }

        const name = m.findDirectStatement(Statements.MethodImplementation)?.findDirectExpression(
          Expressions.MethodName)?.getFirstToken().getStr();

        res.push({
          file,
          pos: m.getFirstToken().getStart(),
          name: name ? name : "Error!",
          count,
        });
      }
    }

    return res;
  }

}