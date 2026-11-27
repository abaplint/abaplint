import * as Statements from "../../2_statements/statements";
import * as Structures from "../../3_structures/structures";
import {MacroCall} from "../../2_statements/statements/_statement";
import {StructureNode} from "../../nodes";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

// in classes WHEN must follow CASE directly, outside of classes anything else there is only a warning
export class Case {
  public static runSyntax(node: StructureNode, input: SyntaxInput): void {
    if (input.scope.getEnclosingClassName() === undefined) {
      return;
    }

    // the first child is the CASE statement, the last one is ENDCASE
    for (const child of node.getChildren().slice(1)) {
      const found = child instanceof StructureNode && child.get() instanceof Structures.Normal
        ? child.getChildren()[0]
        : child;
      const type = found.get();

      if (type instanceof Structures.When) {
        return;
      } else if (type instanceof Statements.SetExtendedCheck) {
        continue;
      } else if (type instanceof MacroCall
          || type instanceof Statements.Include
          || type instanceof Statements.EnhancementPoint
          || type instanceof Structures.Enhancement
          || type instanceof Structures.EnhancementSection) {
        // what these bring along is not known here, it might be the WHEN
        return;
      }

      input.issues.push(syntaxIssue(input, found.getFirstToken(), `CASE must be followed directly by WHEN`));
      return;
    }
  }
}
