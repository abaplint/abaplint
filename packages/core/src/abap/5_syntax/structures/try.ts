import * as Expressions from "../../2_statements/expressions";
import * as Statements from "../../2_statements/statements";
import * as Structures from "../../3_structures/structures";
import {StructureNode} from "../../nodes";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

// "special exceptions must be caught before general exceptions", a CATCH of a class that inherits
// from a class named before it in the same TRY, in an earlier CATCH or earlier in the same CATCH, is never reached,
// this is a syntax error
// only reported when the lineage of the later class is known up to the earlier class, void classes are skipped
export class Try {
  public static runSyntax(node: StructureNode, input: SyntaxInput): void {
    const caught = new Set<string>();
    for (const catchStructure of node.findDirectStructures(Structures.Catch)) {
      const statement = catchStructure.findDirectStatement(Statements.Catch);
      if (statement === undefined) {
        continue;
      }
      // each class counts as caught right after it, also for the next classes of the same CATCH statement
      for (const c of statement.findDirectExpressions(Expressions.ClassName)) {
        const token = c.getFirstToken();
        const className = token.getStr().toUpperCase();
        const superclass = caught.size === 0 ? undefined : this.findCaughtSuperclass(className, caught, input);
        if (superclass !== undefined) {
          const message = `CATCH of ${className} after the CATCH of its superclass ${superclass}`;
          input.issues.push(syntaxIssue(input, token, message));
          return;
        }
        caught.add(className);
      }
    }
  }

  private static findCaughtSuperclass(className: string, caught: Set<string>, input: SyntaxInput): string | undefined {
    const visited = new Set<string>([className]);
    let current = input.scope.findClassDefinition(className);
    while (current !== undefined) {
      const superclass = current.getSuperClass()?.toUpperCase();
      if (superclass === undefined || visited.has(superclass)) {
        return undefined;
      } else if (caught.has(superclass)) {
        return superclass;
      }
      visited.add(superclass);
      current = input.scope.findClassDefinition(superclass);
    }
    return undefined;
  }
}
