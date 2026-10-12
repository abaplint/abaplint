import * as Statements from "../../2_statements/statements";
import * as Structures from "../../3_structures/structures";
import {StatementNode, StructureNode} from "../../nodes";
import {IStructure} from "../../3_structures/structures/_structure";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

type StructureType = new () => IStructure;

const LOOPS: StructureType[] = [
  Structures.Loop,
  Structures.LoopAtScreen,
  Structures.LoopExtract,
  Structures.Do,
  Structures.While,
  Structures.Select,
  Structures.With,
  Structures.Provide,
];

// a CLEANUP block cannot contain statements that statically leave it: RETURN, and EXIT, CONTINUE or CHECK
// that do not belong to a loop inside the block, these end a loop outside the TRY or the processing block
export class Cleanup {
  public static runSyntax(node: StructureNode, input: SyntaxInput): void {
    if (input.scope.getOpenABAP()) {
      return;
    }
    const body = node.findDirectStructure(Structures.Body);
    if (body !== undefined) {
      this.walk(body, false, input);
    }
  }

  private static walk(node: StructureNode, inLoop: boolean, input: SyntaxInput): void {
    for (const child of node.getChildren()) {
      if (child instanceof StructureNode) {
        const stru = child.get();
        // a nested CLEANUP block is checked on its own, macro definitions and test injections do not run here
        if (stru instanceof Structures.Cleanup
            || stru instanceof Structures.Define
            || stru instanceof Structures.TestInjection) {
          continue;
        }
        this.walk(child, inLoop || LOOPS.some(l => stru instanceof l), input);
      } else if (child instanceof StatementNode) {
        const name = this.leavingStatement(child, inLoop);
        if (name !== undefined) {
          const message = `${name} cannot leave a CLEANUP block`;
          input.issues.push(syntaxIssue(input, child.getFirstToken(), message));
        }
      }
    }
  }

  private static leavingStatement(node: StatementNode, inLoop: boolean): string | undefined {
    const s = node.get();
    if (s instanceof Statements.Return) {
      return "RETURN";
    } else if (inLoop === true) {
      return undefined;
    } else if (s instanceof Statements.Exit && node.findDirectTokenByText("FROM") === undefined) {
      return "EXIT";
    } else if (s instanceof Statements.Continue) {
      return "CONTINUE";
    } else if (s instanceof Statements.Check) {
      return "CHECK";
    }
    return undefined;
  }
}
