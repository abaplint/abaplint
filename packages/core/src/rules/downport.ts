import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {Unknown} from "../abap/2_statements/statements/_statement";
import {ExpressionNode, StatementNode} from "../abap/nodes";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {IEdit, EditHelper} from "../edit_helper";
import {Position, VirtualPosition} from "../position";
import {ABAPFile} from "../abap/abap_file";
import {IRegistry} from "../_iregistry";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {Version} from "../version";
import {Registry} from "../registry";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ISyntaxResult} from "../abap/5_syntax/_spaghetti_scope";
import {ReferenceType} from "../abap/5_syntax/_reference";
import {IClassDefinition} from "../abap/types/_class_definition";

export class DownportConf extends BasicRuleConfig {
}

export class Downport implements IRule {
  private lowReg: IRegistry;
  private highReg: IRegistry;
  private conf = new DownportConf();
  private counter: number;

  public getMetadata(): IRuleMetadata {
    return {
      key: "downport",
      title: "Downport statement",
      shortDescription: `Experimental downport functionality`,
      extendedInformation: `
Much like the 'commented_code' rule this rule loops through unknown statements and tries parsing with
a higher level language version. If successful, various rules are applied to downport the statement.
Target downport version is always v702, thus rule is only enabled if target version is v702.

Current rules:
* NEW transformed to CREATE OBJECT, opposite of https://rules.abaplint.org/use_new/
* DATA() definitions are outlined, opposite of https://rules.abaplint.org/prefer_inline/
* FIELD-SYMBOL() definitions are outlined
* CONV is outlined
* EMPTY KEY is changed to DEFAULT KEY, opposite of DEFAULT KEY in https://rules.abaplint.org/avoid_use/
* CAST changed to ?=
* LOOP AT method_call( ) is outlined

Only one transformation is applied to a statement at a time, so multiple steps might be required to do the full downport.`,
      tags: [RuleTag.Experimental, RuleTag.Downport, RuleTag.Quickfix],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: DownportConf): void {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.lowReg = reg;
    return this;
  }

  public run(lowObj: IObject): Issue[] {
    const ret: Issue[] = [];
    this.counter = 1;

    if (this.lowReg.getConfig().getVersion() !== Version.v702) {
      return ret;
    } else if (!(lowObj instanceof ABAPObject)) {
      return ret;
    }

    this.initHighReg();
    const highObj = this.highReg.getObject(lowObj.getType(), lowObj.getName());
    if (highObj === undefined || !(highObj instanceof ABAPObject)) {
      return ret;
    }

    const highSyntax = new SyntaxLogic(this.highReg, highObj).run();

    for (const lowFile of lowObj.getABAPFiles()) {
      const highFile = highObj.getABAPFileByName(lowFile.getFilename());
      if (highFile === undefined) {
        continue;
      }

      const lowStatements = lowFile.getStatements();
      const highStatements = highFile.getStatements();
      if (lowStatements.length !== highStatements.length) {
        // after applying a fix, there might be more statements in lowFile
        // should highReg be initialized again?
        /*
        const message = "Internal Error: Statement lengths does not match";
        ret.push(Issue.atStatement(lowFile, lowStatements[0], message, this.getMetadata().key));
        */
        continue;
      }

      for (let i = 0; i < lowStatements.length; i++) {
        const low = lowStatements[i];
        const high = highStatements[i];
        if ((low.get() instanceof Unknown && !(high.get() instanceof Unknown))
            || high.findFirstExpression(Expressions.InlineData)) {
          const issue = this.checkStatement(low, high, lowFile, highSyntax);
          if (issue) {
            ret.push(issue);
          }
        }
      }
    }

    return ret;
  }

////////////////////

  /** clones the orginal repository into highReg, and parses it with higher language version */
  private initHighReg() {
    if (this.highReg !== undefined) {
      return;
    }
    // use default configuration, ie. default target version
    // todo: consider globalConstants, globalMacros, errorNamespace?
    this.highReg = new Registry();

    for (const o of this.lowReg.getObjects()) {
      for (const f of o.getFiles()) {
        if (this.lowReg.isDependency(o) === true) {
          this.highReg.addDependency(f);
        } else {
          this.highReg.addFile(f);
        }
      }
    }

    this.highReg.parse();
  }

  /** applies one rule at a time, multiple iterations are required to transform complex statements */
  private checkStatement(low: StatementNode, high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (low.getFirstToken().getStart() instanceof VirtualPosition) {
      return undefined;
    }

    let found = this.emptyKey(high, lowFile);
    if (found) {
      return found;
    }

    found = this.outlineLoop(high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.outlineCast(high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.outlineConv(high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.outlineData(high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.outlineFS(high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.newToCreateObject(high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    // todo, add more rules here

    return undefined;
  }

//////////////////////////////////////////

  private emptyKey(node: StatementNode, lowFile: ABAPFile): Issue | undefined {

    for (const i of node.findAllExpressions(Expressions.TypeTable)) {
      const concat = i.concatTokens();
      if (concat.includes("WITH EMPTY KEY") === false) {
        continue;
      }
      const token = i.findDirectTokenByText("EMPTY");
      if (token === undefined) {
        continue;
      }

      const fix = EditHelper.replaceToken(lowFile, token, "DEFAULT");
      return Issue.atToken(lowFile, i.getFirstToken(), "Downport EMPTY KEY", this.getMetadata().key, this.conf.severity, fix);
    }

    return;
  }

  private outlineLoop(node: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {

    if (!(node.get() instanceof Statements.Loop)) {
      return undefined;
    } else if (node.findDirectExpression(Expressions.BasicSource)) {
      return undefined;
    }

    // the first Source must be outlined
    const s = node.findDirectExpression(Expressions.Source);
    if (s === undefined) {
      return undefined;
    }

    const uniqueName = this.uniqueName(node.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);

    const code = `DATA(${uniqueName}) = ${s.concatTokens()}.\n`;
    const fix1 = EditHelper.insertAt(lowFile, node.getFirstToken().getStart(), code);
    const fix2 = EditHelper.replaceRange(lowFile, s.getFirstToken().getStart(), s.getLastToken().getEnd(), uniqueName);
    const fix = EditHelper.merge(fix2, fix1);

    return Issue.atToken(lowFile, node.getFirstToken(), "Outline LOOP input", this.getMetadata().key, this.conf.severity, fix);
  }

  private outlineFS(node: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {

    for (const i of node.findAllExpressionsRecursive(Expressions.InlineFS)) {
      const nameToken = i.findDirectExpression(Expressions.TargetFieldSymbol)?.getFirstToken();
      if (nameToken === undefined) {
        continue;
      }
      const name = nameToken.getStr();
      const spag = highSyntax.spaghetti.lookupPosition(nameToken.getStart(), lowFile.getFilename());
      if (spag === undefined) {
        continue;
      }
      const found = spag.findVariable(name);
      if (found === undefined) {
        continue;
      }
      const type = found.getType().getQualifiedName() ? found.getType().getQualifiedName() : found.getType().toABAP();

      const code = `FIELD-SYMBOLS ${name} TYPE ${type}.\n`;
      const fix1 = EditHelper.insertAt(lowFile, node.getFirstToken().getStart(), code);
      const fix2 = EditHelper.replaceRange(lowFile, i.getFirstToken().getStart(), i.getLastToken().getEnd(), name);
      const fix = EditHelper.merge(fix2, fix1);

      return Issue.atToken(lowFile, i.getFirstToken(), "Outline FIELD-SYMBOL", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private outlineData(node: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {

    for (const i of node.findAllExpressionsRecursive(Expressions.InlineData)) {
      const nameToken = i.findDirectExpression(Expressions.TargetField)?.getFirstToken();
      if (nameToken === undefined) {
        continue;
      }
      const name = nameToken.getStr();
      const spag = highSyntax.spaghetti.lookupPosition(nameToken.getStart(), lowFile.getFilename());
      if (spag === undefined) {
        continue;
      }
      const found = spag.findVariable(name);
      if (found === undefined) {
        continue;
      }
      const type = found.getType().getQualifiedName() ? found.getType().getQualifiedName() : found.getType().toABAP();

      const code = `DATA ${name} TYPE ${type}.\n`;
      const fix1 = EditHelper.insertAt(lowFile, node.getFirstToken().getStart(), code);
      const fix2 = EditHelper.replaceRange(lowFile, i.getFirstToken().getStart(), i.getLastToken().getEnd(), name);
      const fix = EditHelper.merge(fix2, fix1);

      return Issue.atToken(lowFile, i.getFirstToken(), "Outline DATA", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private outlineConv(node: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {

    for (const i of node.findAllExpressionsRecursive(Expressions.Source)) {
      if (i.getFirstToken().getStr().toUpperCase() !== "CONV") {
        continue;
      }

      const body = i.findDirectExpression(Expressions.ConvBody)?.concatTokens();
      if (body === undefined) {
        continue;
      }

      const uniqueName = this.uniqueName(i.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
      const type = i.findDirectExpression(Expressions.TypeNameOrInfer)?.concatTokens(); // todo, find inferred types

      const abap = `DATA ${uniqueName} TYPE ${type}.\n${uniqueName} = ${body}.`;
      const fix1 = EditHelper.insertAt(lowFile, node.getFirstToken().getStart(), abap + "\n");
      const fix2 = EditHelper.replaceRange(lowFile, i.getFirstToken().getStart(), i.getLastToken().getEnd(), uniqueName);
      const fix = EditHelper.merge(fix2, fix1);

      return Issue.atToken(lowFile, i.getFirstToken(), "Downport CONV", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  // "CAST" to "?="
  private outlineCast(node: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {

    for (const i of node.findAllExpressionsRecursive(Expressions.Cast)) {
      const uniqueName = this.uniqueName(i.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
      const type = i.findDirectExpression(Expressions.TypeNameOrInfer)?.concatTokens(); // todo, find inferred types
      const body = i.findDirectExpression(Expressions.Source)?.concatTokens();

      const abap = `DATA ${uniqueName} TYPE REF TO ${type}.\n${uniqueName} ?= ${body}.`;
      const fix1 = EditHelper.insertAt(lowFile, node.getFirstToken().getStart(), abap + "\n");
      const fix2 = EditHelper.replaceRange(lowFile, i.getFirstToken().getStart(), i.getLastToken().getEnd(), uniqueName);
      const fix = EditHelper.merge(fix2, fix1);

      return Issue.atToken(lowFile, i.getFirstToken(), "Downport CAST", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private uniqueName(position: Position, filename: string, highSyntax: ISyntaxResult): string {
    const spag = highSyntax.spaghetti.lookupPosition(position, filename);
    if (spag === undefined) {
      return "uniqueErrorSpag";
    }

    while (true) {
      const name = "temp" + this.counter;
      const found = spag.findVariable(name);
      this.counter++;
      if (found === undefined) {
        return name;
      }
    }

  }

  private newToCreateObject(node: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    const source = node.findDirectExpression(Expressions.Source);

    let fix: IEdit | undefined = undefined;
    if (node.get() instanceof Statements.Move && source && source.concatTokens().startsWith("NEW ")) {
      const target = node.findDirectExpression(Expressions.Target);
      const found = source?.findFirstExpression(Expressions.NewObject);
      // must be at top level of the source for quickfix to work(todo: handle more scenarios)
      // todo, assumption: the target is not an inline definition
      if (target && found && source.concatTokens() === found.concatTokens()) {
        const abap = this.newParameters(found, target.concatTokens(), highSyntax, lowFile);
        if (abap !== undefined) {
          fix = EditHelper.replaceRange(lowFile, node.getFirstToken().getStart(), node.getLastToken().getEnd(), abap);
        }
      }
    }

    if (fix === undefined && node.findAllExpressions(Expressions.NewObject)) {
      const found = node.findFirstExpression(Expressions.NewObject);
      if (found === undefined) {
        return undefined;
      }
      const name = this.uniqueName(found.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
      const abap = this.newParameters(found, name, highSyntax, lowFile);
      if (abap === undefined) {
        return undefined;
      }

      const type = found.findDirectExpression(Expressions.TypeNameOrInfer)?.concatTokens();

      const data = `DATA ${name} TYPE REF TO ${type}.`;
      const fix1 = EditHelper.insertAt(lowFile, node.getFirstToken().getStart(), data + "\n" + abap + "\n");
      const fix2 = EditHelper.replaceRange(lowFile, found.getFirstToken().getStart(), found.getLastToken().getEnd(), name);
      fix = EditHelper.merge(fix2, fix1);
    }

    if (fix) {
      return Issue.atToken(lowFile, node.getFirstToken(), "Use CREATE OBJECT instead of NEW", this.getMetadata().key, this.conf.severity, fix);
    } else {
      return undefined;
    }
  }

  private newParameters(found: ExpressionNode, name: string, highSyntax: ISyntaxResult, lowFile: ABAPFile): string | undefined {
    const typeToken = found.findDirectExpression(Expressions.TypeNameOrInfer)?.getFirstToken();
    let extra = typeToken?.getStr() === "#" ? "" : " TYPE " + typeToken?.getStr();

    const parameters = found.findFirstExpression(Expressions.ParameterListS);
    if (parameters) {
      extra = parameters ? extra + " EXPORTING " + parameters.concatTokens() : extra;
    } else if (typeToken) {
      const source = found.findDirectExpression(Expressions.Source)?.concatTokens();
      if (source) {
        // find the default parameter name for the constructor
        const spag = highSyntax.spaghetti.lookupPosition(typeToken?.getStart(), lowFile.getFilename());

        let cdef: IClassDefinition | undefined = undefined;
        for (const r of spag?.getData().references || []) {
          if ((r.referenceType === ReferenceType.InferredType
              || r.referenceType === ReferenceType.ObjectOrientedReference)
              && r.resolved && r.position.getStart().equals(typeToken.getStart())) {
            cdef = r.resolved as IClassDefinition;
          }
        }

        const importing = cdef?.getMethodDefinitions().getByName("CONSTRUCTOR")?.getParameters().getDefaultImporting();
        if (importing) {
          extra += " EXPORTING " + importing + " = " + source;
        } else if (spag === undefined) {
          extra += " SpagUndefined";
        } else if (cdef === undefined) {
          extra += " ClassDefinitionNotFound";
        } else {
          extra += " SomeError";
        }
      }
    }

    const abap = `CREATE OBJECT ${name}${extra}.`;

    return abap;
  }

}