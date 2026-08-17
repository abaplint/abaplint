import * as Expressions from "../../2_statements/expressions";
import * as Statements from "../../2_statements/statements";
import {StructureNode} from "../../nodes";
import {ObjectOriented} from "../_object_oriented";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class Method {
  /** checks that the instance constructor calls the constructor of the super class */
  public runSyntax(node: StructureNode, input: SyntaxInput): void {
    const methodToken = node.findDirectStatement(Statements.MethodImplementation)
      ?.findFirstExpression(Expressions.MethodName)?.getFirstToken();
    if (methodToken === undefined || methodToken.getStr().toUpperCase() !== "CONSTRUCTOR") {
      return;
    }

    const classDefinition = input.scope.findClassDefinition(input.scope.getName());
    const superName = classDefinition?.getSuperClass();
    if (superName === undefined) {
      return;
    }

    const superDefinition = input.scope.findClassDefinition(superName);
    if (superDefinition === undefined) {
      // unknown or voided super class
      return;
    }

    const helper = new ObjectOriented(input.scope);
    if (helper.searchMethodName(superDefinition, "constructor").method === undefined) {
      return;
    }

    if (this.callsSuperConstructor(node) === true) {
      return;
    }

    const message = "Constructor must call super->constructor( )";
    input.issues.push(syntaxIssue(input, methodToken, message));
  }

  private callsSuperConstructor(node: StructureNode): boolean {
    for (const statement of node.findAllStatementNodes()) {
      const tokens = statement.getTokens();
      for (let i = 0; i < tokens.length - 2; i++) {
        if (tokens[i].getStr().toUpperCase() === "SUPER"
            && tokens[i + 1].getStr() === "->"
            && tokens[i + 2].getStr().toUpperCase() === "CONSTRUCTOR") {
          return true;
        }
      }
    }
    return false;
  }
}
