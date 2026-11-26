import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode, TokenNode} from "../../nodes";
import {Source} from "../expressions/source";
import {FSTarget} from "../expressions/fstarget";
import {AnyType, CharacterType, DataReference, DataType, GenericObjectReferenceType, ObjectReferenceType,
  TableType, VoidType} from "../../types/basic";
import {StatementSyntax} from "../_statement_syntax";
import {AbstractType} from "../../types/basic/_abstract_type";
import {Dynamic} from "../expressions/dynamic";
import {TypeUtils} from "../_type_utils";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {LanguageVersion, Release, releaseAtLeast} from "../../../version";

export class Assign implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const children = node.getChildren();
    const assignSource = node.findDirectExpression(Expressions.AssignSource);
    const operands = assignSource?.getChildren();
    const firstAssign = operands?.[0];
    const isComponent = firstAssign instanceof TokenNode && firstAssign.get().getStr().toUpperCase() === "COMPONENT";
    const directSource = operands?.length === 1 && firstAssign instanceof ExpressionNode
      && firstAssign.get() instanceof Expressions.Source ? firstAssign : undefined;
    const sources = directSource ? undefined : assignSource?.findDirectExpressionsMulti([Expressions.Source, Expressions.SimpleSource3]);
    const theSource = directSource ?? sources?.[sources.length - 1];
    const sourceChild = directSource?.getChildren()[0];
    const simple = children.length === 5 && directSource?.getChildren().length === 1 && sourceChild instanceof ExpressionNode
      && sourceChild.get() instanceof Expressions.FieldChain && sourceChild.getChildren().length === 1
      && sourceChild.getChildren()[0].get() instanceof Expressions.SourceField;

    let sourceType: AbstractType | undefined;
    const secondAssign = operands?.[1];
    const thirdAssign = operands?.[2];
    if (secondAssign?.concatTokens() === "=>" && firstAssign && thirdAssign?.get() instanceof Expressions.Dynamic) {
      const name = firstAssign.concatTokens();
      const found = input.scope.findClassDefinition(name) || input.scope.findVariable(name);
      if (found === undefined && input.scope.getDDIC().inErrorNamespace(name) && name.startsWith("(") === false) {
        const message = name + " not found, dynamic";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
      sourceType = VoidType.get("Dynamic");
    } else {
      sourceType = Source.runSyntax(theSource, input, undefined, false, isComponent === false);
      if (theSource && secondAssign?.concatTokens() === "->"
          && thirdAssign?.get() instanceof Expressions.Dynamic
          && sourceType?.isGeneric() === true
          && !(sourceType instanceof DataReference)
          && !(sourceType instanceof ObjectReferenceType)
          && !(sourceType instanceof GenericObjectReferenceType)
          && !releaseAtLeast(input.scope.getRelease(), Release.v756)
          && input.scope.getLanguageVersion() !== LanguageVersion.Cloud
          && !input.scope.getOpenABAP()) {
        const message = `"${theSource.concatTokens()}" is not a reference variable`;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    }

    if (firstAssign instanceof ExpressionNode && firstAssign.get() instanceof Expressions.Dynamic) {
      input.referenceMayChange?.(firstAssign, input.scope);
    } else if (isComponent === false) {
      const address = children[1];
      if (address !== assignSource && address instanceof ExpressionNode && address.get() instanceof Expressions.Target) {
        // ASSIGN ... INCREMENT stores the address before AssignSource, which contains the increment.
        input.referenceMayChange?.(address, input.scope);
      } else if (secondAssign === undefined && sourceType instanceof DataReference) {
        input.referenceMayChange?.(theSource, input.scope);
      }
    }

    if (operands?.length === 5 && isComponent && sources) {
      const componentSource = sources[sources.length - 2];
      const componentType = Source.runSyntax(componentSource, input);
      if (new TypeUtils(input.scope).isAssignable(componentType, new CharacterType(30)) === false) {
        const message = "component name must be charlike";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    }

    if (sourceType === undefined || (!simple && assignSource?.findDirectExpression(Expressions.Dynamic))) {
      sourceType = AnyType.get();
    }
    if (!simple) {
      for (const d of assignSource?.findAllExpressions(Expressions.Dynamic) ?? []) {
        Dynamic.runSyntax(d, input);
      }
    }

    const target = node.findDirectExpression(Expressions.FSTarget);
    if (target) {
      if (isComponent) {
        FSTarget.runSyntax(target, input, AnyType.get());
      } else {
        const dereferencedType = secondAssign?.get() instanceof Expressions.Dereference && sourceType instanceof DataReference
          ? sourceType.getType() : undefined;
        const assignedType = dereferencedType ?? sourceType;
        FSTarget.runSyntax(target, input, assignedType);
        if ((assignedType instanceof TableType || assignedType instanceof AnyType || assignedType instanceof DataType)
            && theSource && firstAssign === theSource && (secondAssign === undefined || dereferencedType !== undefined)
            && children[1] === assignSource) {
          input.tableAlias = {source: theSource, target, fromReference: dereferencedType !== undefined};
        }
      }
    }

    if (!simple) {
      for (const s of node.findAllExpressions(Expressions.Source)) {
        if (s !== theSource) {
          Source.runSyntax(s, input);
        }
      }
    }

  }
}
