import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {Dynamic} from "../expressions/dynamic";
import {ReferenceType} from "../_reference";
import {AnyType, DataType, GenericObjectReferenceType, ObjectReferenceType, UnknownType, VoidType} from "../../types/basic";
import {ClassDefinition, InterfaceDefinition} from "../../types";
import {StatementSyntax} from "../_statement_syntax";
import {IClassDefinition} from "../../types/_class_definition";
import {ObjectOriented} from "../_object_oriented";
import {TypeUtils} from "../_type_utils";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class CreateObject implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    let cdef: IClassDefinition | undefined = undefined;

    // CREATE OBJECT, TYPE
    const type = node.findExpressionAfterToken("TYPE");
    if (type && type.get() instanceof Expressions.ClassName) {
      const token = type.getFirstToken();
      const name = token.getStr();
      cdef = input.scope.findClassDefinition(name);
      if (cdef) {
        input.scope.addReference(token, cdef, ReferenceType.ObjectOrientedReference, input.filename);
        if (cdef.isAbstract() === true) {
          const message = cdef.getName() + " is abstract, cannot be instantiated";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        }
      } else if (input.scope.getDDIC().inErrorNamespace(name) === false) {
        input.scope.addReference(token, undefined, ReferenceType.ObjectOrientedVoidReference, input.filename, {ooName: name, ooType: "CLAS"});
      } else {
        const message = "TYPE \"" + name + "\" not found";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    }

    // just recurse
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, input);
    }

    let first = true;
    for (const t of node.findAllExpressions(Expressions.Target)) {
      const found = new Target().runSyntax(t, input);
      if (first === true) {
        first = false;
        if (found instanceof VoidType) {
          continue;
        } else if (found instanceof UnknownType) {
          const message = "Target type unknown, " + t.concatTokens();
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        } else if (!(found instanceof ObjectReferenceType)
            && !(found instanceof AnyType)
            && !(found instanceof DataType)
            && !(found instanceof GenericObjectReferenceType)) {
          const message = "Target must be an object reference, " + t.concatTokens();
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        } else if (found instanceof GenericObjectReferenceType && type === undefined) {
          const message = "Generic type, cannot be instantiated";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        } else if (found instanceof ObjectReferenceType) {
          const id = found.getIdentifier();
          if (id instanceof InterfaceDefinition && type === undefined) {
            const message = "Interface reference, cannot be instantiated";
            input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
            return;
          } else if (found instanceof ObjectReferenceType
              && type === undefined
              && input.scope.findInterfaceDefinition(found.getQualifiedName())) {
            const message = "Interface reference, cannot be instantiated";
            input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
            return;
          } else if (id instanceof ClassDefinition && cdef === undefined) {
            cdef = id;
          }
          if (type === undefined && id instanceof ClassDefinition && id.isAbstract() === true) {
            const message = id.getName() + " is abstract, cannot be instantiated";
            input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
            return;
          }
        }
      }
    }

    for (const t of node.findDirectExpressions(Expressions.Dynamic)) {
      new Dynamic().runSyntax(t, input);
    }

    this.validateParameters(cdef, node, input);
  }

  private validateParameters(cdef: IClassDefinition | undefined, node: StatementNode, input: SyntaxInput): void {
    if (cdef === undefined) {
      const sources = node.findDirectExpression(Expressions.ParameterListS)?.findAllExpressions(Expressions.Source);
      for (const s of sources || []) {
        new Source().runSyntax(s, input);
      }
      return;
    }

    const methodDef = new ObjectOriented(input.scope).searchMethodName(cdef, "CONSTRUCTOR");
    const methodParameters = methodDef.method?.getParameters();

    const allImporting = methodParameters?.getImporting() || [];
    const requiredImporting = new Set(methodParameters?.getRequiredParameters().map(i => i.getName().toUpperCase()));

    for (const p of node.findDirectExpression(Expressions.ParameterListS)?.findAllExpressions(Expressions.ParameterS) || []) {
      const name = p.findDirectExpression(Expressions.ParameterName)?.concatTokens().toUpperCase();
      if (name === undefined) {
        continue;
      }

      const source = p.findDirectExpression(Expressions.Source);
      const sourceType = new Source().runSyntax(source, input);

      const calculated = source?.findFirstExpression(Expressions.MethodCallChain) !== undefined
        || source?.findFirstExpression(Expressions.StringTemplate) !== undefined
        || source?.findFirstExpression(Expressions.ArithOperator) !== undefined;

      const found = allImporting?.find(p => p.getName().toUpperCase() === name);
      if (found === undefined) {
        const message = `constructor parameter "${name}" does not exist`;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      } else if (new TypeUtils(input.scope).isAssignableStrict(sourceType, found.getType(), calculated) === false) {
        const message = `constructor parameter "${name}" type not compatible`;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }

      requiredImporting.delete(name);
    }

    for (const r of requiredImporting.values()) {
      const message = `constructor parameter "${r}" must be supplied`;
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }
  }
}