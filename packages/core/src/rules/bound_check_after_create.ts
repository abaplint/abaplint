import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {ExpressionNode, StatementNode, TokenNode} from "../abap/nodes";
import {Identifier} from "../abap/4_file_information/_identifier";
import {IdentifierMeta, TypedIdentifier} from "../abap/types/_typed_identifier";
import {ObjectReferenceType} from "../abap/types/basic";
import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {ObjectAnalysis, PredicateKind, Procedure, Variable, foldIf, isImmutable, plainMove,
  simplePredicate} from "./_procedure_analysis";

export class BoundCheckAfterCreateConf extends BasicRuleConfig {
}

/** a local variable, or an attribute reached via me or a local variable */
interface IPath {
  /** the local variable, or the local base of base->attr */
  local: Variable | undefined;
  attribute: Identifier | undefined;
}

export class BoundCheckAfterCreate implements IRule {
  private reg: IRegistry;
  private conf = new BoundCheckAfterCreateConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "bound_check_after_create",
      title: "Bound check after create",
      shortDescription: `Finds IF r IS BOUND / IS NOT BOUND directly after r was created`,
      extendedInformation: `Reports IF r IS BOUND. and IF r IS NOT BOUND. after CREATE OBJECT r., r = NEW ...( ). or
DATA(r) = NEW ...( ). in the same block, when all of the following hold:

* r is a local variable whose address is never taken, or an attribute: attr, me->attr or local->attr
* CREATE OBJECT has no EXCEPTIONS addition and no dynamic type, NEW is not followed by a method call
* every statement in between is a direct statement of the same block, not a nested structure
* a local r is not written in between
* for an attribute: no method, function or form call and no constructor in between, the local before ->
  is not written, and no write in between can change the attribute: no write to an attribute with the
  same name, to a field symbol, via ->*, or to a parameter passed by reference

The quick fix keeps the IS BOUND branch and removes the rest, or removes the IS NOT BOUND branch;
nothing is reported if a removed branch declares data that is used outside of it.
Objects with syntax errors, macros or unknown statements are skipped, as are procedures with dynamic code,
INCLUDE, test seams, enhancements or native SQL. No release requirement.`,
      tags: [RuleTag.Quickfix, RuleTag.SingleFile],
      badExample: `CREATE OBJECT lo_log.
IF lo_log IS BOUND.
  lo_log->add( 'started' ).
ENDIF.`,
      goodExample: `CREATE OBJECT lo_log.
lo_log->add( 'started' ).`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: BoundCheckAfterCreateConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): readonly Issue[] {
    const analysis = ObjectAnalysis.run(this.reg, obj);
    if (analysis === undefined) {
      return [];
    }

    const issues: Issue[] = [];
    for (const procedure of analysis.procedures) {
      if (procedure.supported === false) {
        continue;
      }
      for (const statement of procedure.statements) {
        const predicate = simplePredicate(statement);
        if (!(statement.get() instanceof Statements.If) || predicate?.kind !== PredicateKind.Bound) {
          continue;
        }
        const checked = this.path(procedure, predicate.left);
        const create = checked === undefined ? undefined : this.findCreate(procedure, statement, checked);
        const structure = procedure.ifStructure(statement);
        if (create === undefined || structure === undefined) {
          continue;
        }
        const bound = predicate.negated === false;
        const fix = foldIf(procedure, structure, statement, bound);
        if (fix === undefined) {
          continue;
        }
        const message = predicate.left.concatTokens() + " is always bound, it is created in line " + create.getStart().getRow();
        issues.push(Issue.atStatement(procedure.file, statement, message, this.getMetadata().key, this.conf.severity, fix));
      }
    }
    return issues;
  }

  /** the CREATE OBJECT or NEW before the IF in the same block, with only straight statements in between
   * that cannot change the reference */
  private findCreate(procedure: Procedure, check: StatementNode, path: IPath): StatementNode | undefined {
    const index = procedure.index(check);
    const block = procedure.block(check);
    for (let i = index - 1; i >= 0; i--) {
      const statement = procedure.statements[i];
      if (procedure.block(statement) !== block || !procedure.isSimple(statement)) {
        return undefined;
      }
      const target = this.createdTarget(statement);
      const created = target === undefined ? undefined : this.path(procedure, target);
      if (created !== undefined && this.samePath(created, path)) {
        const between = procedure.straightBetween(statement, check);
        return between !== undefined && between.every(s => this.keeps(procedure, s, path)) ? statement : undefined;
      }
    }
    return undefined;
  }

  /** the target of CREATE OBJECT r. or r = NEW ...( ). */
  private createdTarget(statement: StatementNode): ExpressionNode | undefined {
    if (statement.get() instanceof Statements.CreateObject) {
      if (statement.findDirectTokenByText("EXCEPTIONS") !== undefined
          || statement.findFirstExpression(Expressions.Dynamic) !== undefined
          || statement.getColon() !== undefined) {
        return undefined;
      }
      return statement.findDirectExpression(Expressions.Target);
    }
    const move = plainMove(statement);
    const chain = move?.source.findDirectExpression(Expressions.MethodCallChain);
    if (move === undefined || move.operator !== "=" || move.source.getChildren().length !== 1
        || chain?.getChildren().length !== 1 || chain.findDirectExpression(Expressions.NewObject) === undefined) {
      return undefined;
    }
    return move.target;
  }

  /** r, DATA(r), attr, me->attr or local->attr, as target or source */
  private path(procedure: Procedure, node: ExpressionNode): IPath | undefined {
    let children = node.getChildren();
    if (node.get() instanceof Expressions.Source) {
      const chain = node.findDirectExpression(Expressions.FieldChain);
      if (children.length !== 1 || chain === undefined) {
        return undefined;
      }
      children = chain.getChildren();
    } else if (children.length === 1 && node.findDirectExpression(Expressions.InlineData) !== undefined) {
      const name = node.findDirectExpression(Expressions.InlineData)!.findDirectExpression(Expressions.TargetField);
      const local = name === undefined ? undefined : procedure.local(procedure.identifierAt(name.getFirstToken()));
      return local === undefined || local.escapes() ? undefined : {local, attribute: undefined};
    }
    const first = procedure.identifierAt(children[0]?.getFirstToken());
    if (!(children[0] instanceof ExpressionNode) || !(first instanceof TypedIdentifier)) {
      return undefined;
    }
    const local = procedure.local(first);
    if (children.length === 1) {
      if (local !== undefined) {
        return local.escapes() ? undefined : {local, attribute: undefined};
      }
      return this.isAttribute(procedure, first) ? {local: undefined, attribute: first} : undefined;
    }
    const attribute = children[2] instanceof ExpressionNode && children[2].get() instanceof Expressions.AttributeName
      ? procedure.identifierAt(children[2].getFirstToken()) : undefined;
    if (children.length !== 3 || !(children[1] instanceof TokenNode) || children[1].getFirstToken().getStr() !== "->"
        || attribute === undefined || !this.isAttribute(procedure, attribute)) {
      return undefined;
    }
    if (isImmutable(first) && first.getType() instanceof ObjectReferenceType) {
      return {local: undefined, attribute};
    } else if (local !== undefined && !local.escapes()) {
      return {local, attribute};
    }
    return undefined;
  }

  private isAttribute(procedure: Procedure, identifier: Identifier): boolean {
    if (!(identifier instanceof TypedIdentifier) || identifier.getMeta().includes(IdentifierMeta.Static)
        || procedure.contains(identifier)) {
      return false;
    }
    const meta = identifier.getMeta();
    return !meta.some(m => m === IdentifierMeta.MethodImporting || m === IdentifierMeta.MethodExporting
      || m === IdentifierMeta.MethodChanging || m === IdentifierMeta.MethodReturning
      || m === IdentifierMeta.FormParameter || m === IdentifierMeta.EventParameter
      || m === IdentifierMeta.FunctionModuleImporting || m === IdentifierMeta.FunctionModuleExporting
      || m === IdentifierMeta.FunctionModuleChanging || m === IdentifierMeta.FunctionModuleTables
      || m === IdentifierMeta.BuiltIn || m === IdentifierMeta.InlineDefinition);
  }

  private samePath(a: IPath, b: IPath): boolean {
    const key = (i: Identifier | undefined) => i === undefined ? "" : ObjectAnalysis.key(i);
    return a.local === b.local && key(a.attribute) === key(b.attribute);
  }

  /** the statement between the create and the check cannot change the reference */
  private keeps(procedure: Procedure, statement: StatementNode, path: IPath): boolean {
    const index = procedure.index(statement);
    if (path.local !== undefined && path.local.writes().some(w => w.index === index)) {
      return false;
    }
    if (path.attribute === undefined) {
      return true;
    }
    if (!procedure.isCallFree(statement)) {
      return false;
    }
    const attribute = ObjectAnalysis.key(path.attribute);
    for (const target of statement.findAllExpressionsRecursive(Expressions.Target)) {
      if (target.findFirstExpression(Expressions.TargetFieldSymbol) !== undefined
          || target.findFirstExpression(Expressions.Dereference) !== undefined) {
        return false;
      }
      if (target.findDirectExpression(Expressions.InlineData) !== undefined) {
        continue;
      }
      // the storage changed is inside the last attribute of the chain, or inside the first field
      const attributes = target.findDirectExpressions(Expressions.AttributeName);
      const field = attributes.length > 0 ? attributes[attributes.length - 1] : target.findDirectExpression(Expressions.TargetField);
      const changed = field === undefined ? undefined : procedure.identifierAt(field.getFirstToken());
      if (!(changed instanceof TypedIdentifier) || ObjectAnalysis.key(changed) === attribute) {
        return false;
      }
      const meta = changed.getMeta();
      const variable = procedure.variable(changed);
      const parameter = !procedure.contains(changed) && !this.isAttribute(procedure, changed);
      if (parameter && !meta.includes(IdentifierMeta.PassByValue) && !meta.includes(IdentifierMeta.MethodReturning)) {
        return false;
      } else if (variable?.isLocal() === true && variable.escapes()) {
        return false;
      }
    }
    return true;
  }
}
