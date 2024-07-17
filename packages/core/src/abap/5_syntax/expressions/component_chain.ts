import * as Expressions from "../../2_statements/expressions";
import {AbstractType} from "../../types/basic/_abstract_type";
import {VoidType} from "../../types/basic/void_type";
import {StructureType} from "../../types/basic/structure_type";
import {ExpressionNode} from "../../nodes";
import {DataReference, ObjectReferenceType, UnknownType} from "../../types/basic";
import {ClassDefinition} from "../../types";
import {IReferenceExtras, ReferenceType} from "../_reference";
import {ObjectOriented} from "../_object_oriented";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";

export class ComponentChain {
  public runSyntax(context: AbstractType | undefined, node: ExpressionNode,
                   input: SyntaxInput): AbstractType | undefined {

    if (context === undefined) {
      return undefined;
    }

    const children = node.getChildren();
    for (let i = 0; i < children.length; i++) {
      if (context instanceof VoidType || context instanceof UnknownType) {
        return context;
      }

      const child = children[i];
      if (i === 0 && child.concatTokens().toUpperCase() === "TABLE_LINE") {
        continue;
      } else if (child.get() instanceof Expressions.ArrowOrDash) {
        const concat = child.concatTokens();
        if (concat === "-") {
          if (!(context instanceof StructureType)) {
            const message = "ComponentChain, not a structure";
            input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
            return new VoidType(CheckSyntaxKey);

          }
        } else if (concat === "=>") {
          if (!(context instanceof ObjectReferenceType)) {
            const message = "ComponentChain, not a reference";
            input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
            return new VoidType(CheckSyntaxKey);
          }
        } else if (concat === "->") {
          if (!(context instanceof ObjectReferenceType) && !(context instanceof DataReference)) {
            const message = "ComponentChain, not a reference";
            input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
            return new VoidType(CheckSyntaxKey);
          }
        }
      } else if (child.get() instanceof Expressions.ComponentName) {
        const name = child.concatTokens();

        if (context instanceof DataReference) {
          context = context.getType();
          if (name === "*") {
            continue;
          }
        }

        if (context instanceof StructureType) {
          context = context.getComponentByName(name);
          if (context === undefined) {
            const message = "Component \"" + name + "\" not found in structure";
            input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
            return new VoidType(CheckSyntaxKey);
          }
        } else if (context instanceof ObjectReferenceType) {
          const id = context.getIdentifier();
          const def = input.scope.findObjectDefinition(id.getName());
          if (def === undefined) {
            const message = id.getName() + " not found in scope";
            input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
            return new VoidType(CheckSyntaxKey);
          }

          const helper = new ObjectOriented(input.scope);
          const found = helper.searchAttributeName(def, name);

          context = found?.getType();
          if (context === undefined) {
            const message = "Attribute \"" + name + "\" not found";
            input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
            return new VoidType(CheckSyntaxKey);
          } else {
            const extra: IReferenceExtras = {
              ooName: id.getName(),
              ooType: id instanceof ClassDefinition ? "CLAS" : "INTF"};
            input.scope.addReference(child.getFirstToken(), found, ReferenceType.DataWriteReference, input.filename, extra);
          }
        } else {
          const message = "ComponentChain, not a structure, " + context?.constructor.name;
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return new VoidType(CheckSyntaxKey);
        }
      }
    }

    return context;
  }

}