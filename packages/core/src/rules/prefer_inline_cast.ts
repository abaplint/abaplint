import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {MacroCall, MacroContent, MacroRecursion, Unknown} from "../abap/2_statements/statements/_statement";
import {ReferenceType, IReference} from "../abap/5_syntax/_reference";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ExpressionNode, StatementNode} from "../abap/nodes";
import {Identifier} from "../abap/4_file_information/_identifier";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {ObjectReferenceType} from "../abap/types/basic";
import {EditHelper} from "../edit_helper";
import {Issue} from "../issue";
import {ABAPObject} from "../objects/_abap_object";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {LanguageVersion, Release, releaseAtLeast} from "../version";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";

export class PreferInlineCastConf extends BasicRuleConfig {
}

export class PreferInlineCast implements IRule {
  private reg: IRegistry;
  private conf = new PreferInlineCastConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "prefer_inline_cast",
      title: "Prefer Inline CAST",
      shortDescription: `Inline a CAST helper read only once in the next statement`,
      extendedInformation: `Requires 7.40 SP02 or above, or ABAP Cloud, and no syntax errors.

Reports DATA(t) = CAST type( source ) when the helper has exactly one read and no other access,
except its declaration write, in the entire syntax scope (including earlier reads in loop bodies and exception handlers).
The immediately following statement must be a plain assignment, an attribute read, a receiver method call,
or a named IMPORTING argument of a functional method call (caller syntax p = t).

Only class/interface CAST targets, simple assignment targets and static access are supported.
For argument uses, the CAST operand must be a plain field chain without calls, the receiver and all
other arguments must be plain variables or literals, and the method signature must be known.
Explicit EXPORTING, IMPORTING and CHANGING sections are not supported.
Objects containing macros or dynamic access are skipped. Field symbols, reference-taking,
pragmas and chained statements are not supported.

Predicates such as IS INITIAL / IS BOUND and removal of statically redundant CASTs are left for a future version.`,
      tags: [RuleTag.Styleguide, RuleTag.Quickfix, RuleTag.SingleFile],
      badExample: `DATA(helper) = CAST lcl_node( object ).
result = helper->get_tokens( ).`,
      goodExample: `result = CAST lcl_node( object )->get_tokens( ).`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: PreferInlineCastConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): readonly Issue[] {
    if (!(obj instanceof ABAPObject)
        || (!releaseAtLeast(this.reg.getConfig().getRelease(), Release.v740sp02)
        && this.reg.getConfig().getLanguageVersion() !== LanguageVersion.Cloud)) {
      return [];
    }

    // Neither macro expansion nor a dynamically named variable has reliable references.
    let hasCast = false;
    for (const file of obj.getABAPFiles()) {
      for (const statement of file.getStatements()) {
        hasCast ||= statement.findFirstExpression(Expressions.Cast) !== undefined;
        const type = statement.get();
        if (type instanceof Unknown || type instanceof Statements.Define
            || type instanceof MacroCall || type instanceof MacroContent || type instanceof MacroRecursion
            || statement.findFirstExpression(Expressions.Dynamic) !== undefined) {
          return [];
        }
      }
    }

    if (!hasCast) {
      return [];
    }

    const syntax = new SyntaxLogic(this.reg, obj).run();
    if (syntax.issues.length > 0) {
      return [];
    }
    const references = new Map<string, IReference[]>();
    const knownMethods = new Set<string>();
    for (const reference of this.references(syntax.spaghetti.getTop())) {
      if (reference.resolved === undefined) {
        continue;
      }
      const key = this.identifierKey(reference.resolved);
      const uses = references.get(key) || [];
      uses.push(reference);
      references.set(key, uses);
      if (reference.referenceType === ReferenceType.MethodReference) {
        knownMethods.add(this.identifierKey(reference.position));
      }
    }
    const issues: Issue[] = [];
    for (const file of obj.getABAPFiles()) {
      const statements = file.getStatements();
      for (let index = 0; index < statements.length - 1; index++) {
        const declaration = statements[index];
        const next = statements[index + 1];
        const cast = this.castDeclaration(declaration);
        const inline = declaration.findFirstExpression(Expressions.InlineData);
        const name = inline?.findDirectExpression(Expressions.TargetField)?.getFirstToken();
        if (cast === undefined || name === undefined) {
          continue;
        }
        const scope = syntax.spaghetti.lookupPosition(name.getStart(), file.getFilename());
        const identifier = scope?.findVariable(name.getStr());
        if (!(identifier instanceof TypedIdentifier) || !(identifier.getType() instanceof ObjectReferenceType)
            || identifier.getType().containsVoid()
            || identifier.getType().isGeneric()) {
          continue;
        }
        const uses = references.get(this.identifierKey(identifier)) || [];
        const reads = uses.filter(r => r.referenceType === ReferenceType.DataReadReference);
        const writes = uses.filter(r => r.referenceType === ReferenceType.DataWriteReference);
        if (reads.length !== 1 || writes.length !== 1
            || !declaration.includesToken(writes[0].position.getToken())
            || uses.length !== 2 || !next.includesToken(reads[0].position.getToken())
            || !this.supportedUse(next, reads[0].position, knownMethods, cast)) {
          continue;
        }
        // Replace the later occurrence first, also when both statements are on the same line.
        const fix = EditHelper.merge(
          EditHelper.replaceToken(file, reads[0].position.getToken(), cast.concatTokensWithLinebreaks()),
          EditHelper.deleteStatement(file, declaration));
        issues.push(Issue.atToken(file, name, "Inline single-use CAST helper", this.getMetadata().key, this.conf.severity, fix));
      }
    }
    return issues;
  }

  private identifierKey(identifier: Identifier): string {
    const start = identifier.getStart();
    return identifier.getFilename() + "," + start.getRow() + "," + start.getCol();
  }

  private references(node: ISpaghettiScopeNode): IReference[] {
    return node.getData().references.concat(...node.getChildren().map(child => this.references(child)));
  }

  private castDeclaration(statement: StatementNode): ExpressionNode | undefined {
    if (!(statement.get() instanceof Statements.Move) || statement.getColon() !== undefined
        || statement.getPragmas().length > 0) {
      return undefined;
    }
    const target = statement.findDirectExpression(Expressions.Target);
    const source = statement.findDirectExpression(Expressions.Source);
    const chain = source?.findDirectExpression(Expressions.MethodCallChain);
    const cast = chain?.findDirectExpression(Expressions.Cast);
    if (target?.getChildren().length !== 1 || target.findDirectExpression(Expressions.InlineData) === undefined
        || source?.getChildren().length !== 1 || chain?.getChildren().length !== 1
        || cast === undefined || cast.findDirectExpression(Expressions.Let) !== undefined
        || cast.findDirectExpression(Expressions.Dereference) !== undefined
        || cast.findDirectExpression(Expressions.TypeNameOrInfer)?.concatTokens() === "#"
        || statement.findFirstExpression(Expressions.SourceFieldSymbol) !== undefined
        || statement.getTokens().length !== target.countTokens() + source.countTokens() + 2
        || statement.getTokens()[target.countTokens()].getStr() !== "=") {
      return undefined;
    }
    return cast;
  }

  private supportedUse(statement: StatementNode, read: Identifier, knownMethods: Set<string>, cast: ExpressionNode): boolean {
    if (statement.getColon() !== undefined || statement.getPragmas().length > 0
        || statement.findFirstExpression(Expressions.SourceFieldSymbol) !== undefined
        || statement.findFirstExpression(Expressions.MethodParameters) !== undefined) {
      return false;
    }
    let chain: ExpressionNode | undefined;
    if (statement.get() instanceof Statements.Move) {
      const target = statement.findDirectExpression(Expressions.Target);
      const source = statement.findDirectExpression(Expressions.Source);
      if (target === undefined || source === undefined || !this.simpleTarget(target)
          || statement.getTokens().length !== target.countTokens() + source.countTokens() + 2
          || statement.getTokens()[target.countTokens()].getStr() !== "="
          || source.getChildren().length !== 1) {
        return false;
      }
      const field = source.findDirectExpression(Expressions.FieldChain);
      if (field !== undefined) {
        const tokens = field.getTokens();
        return field.getFirstToken().getStart().equals(read.getStart())
          && (tokens.length === 1 || (tokens.length === 3 && tokens[1].getStr() === "->"
          && field.findDirectExpression(Expressions.AttributeName) !== undefined));
      }
      chain = source.findDirectExpression(Expressions.MethodCallChain);
    } else if (statement.get() instanceof Statements.Call) {
      chain = statement.findDirectExpression(Expressions.MethodCallChain);
    }
    if (chain === undefined) {
      return false;
    }
    const calls = chain.findDirectExpressions(Expressions.MethodCall);
    const receiver = chain.findDirectExpression(Expressions.FieldChain);
    if (calls.length !== 1 || (chain.getChildren().length !== 1 && chain.getChildren().length !== 3)
        || (receiver !== undefined && receiver.countTokens() !== 1)) {
      return false;
    }
    if (receiver?.getFirstToken().getStart().equals(read.getStart())) {
      // The receiver is evaluated first; even calls in its arguments stay after the CAST.
      return true;
    }
    // Named argument uses are limited to functional calls with a known signature.
    const method = calls[0].findDirectExpression(Expressions.MethodName)?.getFirstToken();
    if (!(statement.get() instanceof Statements.Move) || method === undefined
        || !this.plainCastOperand(cast)
        || !knownMethods.has(this.identifierKey(new Identifier(method, read.getFilename())))) {
      return false;
    }
    const parameters = calls[0].findDirectExpression(Expressions.MethodCallParam)
      ?.findDirectExpression(Expressions.ParameterListS)?.findDirectExpressions(Expressions.ParameterS);
    return parameters !== undefined && parameters.some(p =>
      p.findDirectExpression(Expressions.Source)?.getFirstToken().getStart().equals(read.getStart()))
      && parameters.every(p => this.plainSource(p.findDirectExpression(Expressions.Source)));
  }

  private plainCastOperand(cast: ExpressionNode): boolean {
    // Unlike receiver uses, argument uses can evaluate the receiver before the CAST operand.
    // Exclude calls, table expressions and computed offsets/lengths from the field chain.
    const source = cast.findDirectExpression(Expressions.Source);
    const field = source?.findDirectExpression(Expressions.FieldChain);
    return source?.getChildren().length === 1 && field !== undefined
      && field.findFirstExpression(Expressions.MethodCall) === undefined
      && field.findFirstExpression(Expressions.TableExpression) === undefined
      && field.findFirstExpression(Expressions.FieldOffset) === undefined
      && field.findFirstExpression(Expressions.FieldLength) === undefined;
  }

  private simpleTarget(target: ExpressionNode): boolean {
    return target.countTokens() === 1 && target.findDirectExpression(Expressions.TargetField) !== undefined
      || target.getChildren().length === 1 && target.findDirectExpression(Expressions.InlineData) !== undefined;
  }

  private plainSource(source: ExpressionNode | undefined): boolean {
    if (source?.getChildren().length !== 1) {
      return false;
    }
    return source.findDirectExpression(Expressions.Constant) !== undefined
      || source.countTokens() === 1 && source.findDirectExpression(Expressions.FieldChain) !== undefined;
  }
}
