import * as Expressions from "../../2_statements/expressions";
import {AbstractType} from "../../types/basic/_abstract_type";
import {VoidType} from "../../types/basic/void_type";
import {StructureType} from "../../types/basic/structure_type";
import {ExpressionNode} from "../../nodes";
import {DataReference, ObjectReferenceType, UnknownType} from "../../types/basic";
import {ClassDefinition, InterfaceDefinition} from "../../types";
import {IReferenceExtras, ReferenceType} from "../_reference";
import {CurrentScope} from "../_current_scope";

export class ComponentChain {
  public runSyntax(context: AbstractType | undefined, node: ExpressionNode,
                   scope: CurrentScope,
                   filename: string): AbstractType | undefined {

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
            throw new Error("ComponentChain, not a structure");
          }
        } else if (concat === "=>") {
          if (!(context instanceof ObjectReferenceType)) {
            throw new Error("ComponentChain, not a reference");
          }
        } else if (concat === "->") {
          if (!(context instanceof ObjectReferenceType) && !(context instanceof DataReference)) {
            throw new Error("ComponentChain, not a reference");
          }
        }
      } else if (child.get() instanceof Expressions.ComponentName) {
        if (context instanceof DataReference) {
          context = context.getType();
        }

        const name = child.concatTokens();
        if (context instanceof StructureType) {
          context = context.getComponentByName(name);
          if (context === undefined) {
            throw new Error("Component \"" + name + "\" not found in structure");
          }
        } else if (context instanceof ObjectReferenceType) {
          const id = context.getIdentifier();
          if (id instanceof InterfaceDefinition || id instanceof ClassDefinition) {
            const found = id.getAttributes().findByName(name);
            context = found?.getType();
            if (context === undefined) {
              throw new Error("Attribute \"" + name + "\" not found");
            } else {
              const extra: IReferenceExtras = {
                ooName: id.getName(),
                ooType: id instanceof ClassDefinition ? "CLAS" : "INTF"};
              scope.addReference(child.getFirstToken(), found, ReferenceType.DataWriteReference, filename, extra);
            }
          } else {
            throw new Error("ComponentChain, unexpected type2");
          }
        } else {
          throw new Error("ComponentChain, not a structure");
        }
      }
    }

    return context;
  }

}