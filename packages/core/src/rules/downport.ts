/* eslint-disable max-len */
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import * as Structures from "../abap/3_structures/structures";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {Unknown} from "../abap/2_statements/statements/_statement";
import {ExpressionNode, StatementNode, TokenNode} from "../abap/nodes";
import {IEdit, EditHelper} from "../edit_helper";
import {Position} from "../position";
import {VirtualPosition} from "../virtual_position";
import {ABAPFile} from "../abap/abap_file";
import {IRegistry} from "../_iregistry";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {Version} from "../version";
import {Registry} from "../registry";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ISpaghettiScopeNode, ISyntaxResult} from "../abap/5_syntax/_spaghetti_scope";
import {ReferenceType} from "../abap/5_syntax/_reference";
import {IClassDefinition} from "../abap/types/_class_definition";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {ObjectReferenceType, StructureType, TableType, VoidType} from "../abap/types/basic";
import {Config} from "../config";
import {AbstractToken} from "../abap/1_lexer/tokens/abstract_token";
import {At, ParenLeftW, WAt, WParenLeftW, WParenRight, WParenRightW} from "../abap/1_lexer/tokens";
import {IncludeGraph} from "../utils/include_graph";
import {Program} from "../objects";
import {BuiltIn} from "../abap/5_syntax/_builtin";
import {ScopeType} from "../abap/5_syntax/_scope_type";
import {ElseIf} from "../abap/2_statements/statements";
import * as crypto from "crypto";

// todo: refactor each sub-rule to new classes?
// todo: add configuration

export class DownportConf extends BasicRuleConfig {
}

class SkipToNextFile extends Error {
  public issue: Issue;
  public constructor(issue: Issue) {
    super();
    this.issue = issue;
  }
}

class SpagHelper {
  private readonly spag: ISpaghettiScopeNode;

  public constructor(spag: ISpaghettiScopeNode) {
    this.spag = spag;
  }

  public renameVariable(oldName: string, pos: Position, lowFile: ABAPFile, newName: string) {
    let fix: IEdit | undefined = undefined;

    const references = this.findReferences(oldName, pos);
    references.sort((a, b) => {
      if (a.start.equals(b.start)) {
        return 0;
      }
      return a.start.isAfter(b.start) ? 1 : -1;
    });

    for (const r of references) {
      const replace = EditHelper.replaceRange(lowFile, r.start, r.end, newName);
      if (fix === undefined) {
        fix = replace;
      } else {
        fix = EditHelper.merge(replace, fix);
      }
    }

    return fix;
  }

  private findReferences(name: string, pos: Position): {start: Position, end: Position}[] {
    const positions: {start: Position, end: Position}[] = [];

    function has(element: {start: Position, end: Position}): boolean {
      return positions.some(a => a.start.equals(element.start));
    }

    for (const r of this.spag.getData().references) {
      if (r.resolved?.getName() === name && r.resolved?.getStart().equals(pos)) {
        const sub = {
          start: r.position.getStart(),
          end: r.position.getEnd(),
        };
        if (has(sub) === false) {
          positions.push(sub);
        }
      }
    }
    for (const child of this.spag.getChildren()) {
      const subPositions = new SpagHelper(child).findReferences(name, pos);
      for (const sub of subPositions) {
        if (has(sub) === false) {
          positions.push(sub);
        }
      }
    }
    return positions;
  }

  public findRecursiveDuplicate(name: string, skip: Position): TypedIdentifier | undefined {
    const found = this.spag.findVariable(name);
    if (found?.getStart().equals(skip) === false) {
      return found;
    }

    for (const child of this.spag?.getChildren() || []) {
      const sub = new SpagHelper(child).findRecursiveDuplicate(name, skip);
      if (sub) {
        return sub;
      }
    }

    return undefined;
  }

  public isDuplicateName(name: string, pos: Position) {
    let parent = this.spag.getParent();
    while (parent?.getIdentifier().stype === ScopeType.Let
        || parent?.getIdentifier().stype === ScopeType.For) {
      parent = parent.getParent();
    }

    if (parent === undefined) {
      return undefined;
    }
    return new SpagHelper(parent).findRecursiveDuplicate(name, pos) !== undefined;
  }

}

export class Downport implements IRule {
  private lowReg: IRegistry;
  private highReg: IRegistry;
  private conf = new DownportConf();
  private counter: number;
  private graph: IncludeGraph | undefined;

  public getMetadata(): IRuleMetadata {
    return {
      key: "downport",
      title: "Downport statement",
      shortDescription: `Downport functionality`,
      extendedInformation: `Much like the 'commented_code' rule this rule loops through unknown statements and tries parsing with
a higher level language version. If successful, various rules are applied to downport the statement.
Target downport version is always v702, thus rule is only enabled if target version is v702.

Current rules:
* NEW transformed to CREATE OBJECT, opposite of https://rules.abaplint.org/use_new/
* DATA() definitions are outlined, opposite of https://rules.abaplint.org/prefer_inline/
* FIELD-SYMBOL() definitions are outlined
* CONV is outlined
* COND is outlined
* REDUCE is outlined
* SWITCH is outlined
* FILTER is outlined
* APPEND expression is outlined
* INSERT expression is outlined
* EMPTY KEY is changed to DEFAULT KEY, opposite of DEFAULT KEY in https://rules.abaplint.org/avoid_use/
* CAST changed to ?=
* LOOP AT method_call( ) is outlined
* VALUE # with structure fields
* VALUE # with internal table lines
* Table Expressions are outlined
* SELECT INTO @DATA definitions are outlined
* Some occurrences of string template formatting option ALPHA changed to function module call
* SELECT/INSERT/MODIFY/DELETE/UPDATE "," in field list removed, "@" in source/targets removed
* PARTIALLY IMPLEMENTED removed, it can be quick fixed via rule implement_methods
* RAISE EXCEPTION ... MESSAGE
* Moving with +=, -=, /=, *=, &&= is expanded
* line_exists and line_index is downported to READ TABLE
* ENUMs, but does not nessesarily give the correct type and value
* MESSAGE with non simple source

Only one transformation is applied to a statement at a time, so multiple steps might be required to do the full downport.

Make sure to test the downported code, it might not always be completely correct.`,
      tags: [RuleTag.Downport, RuleTag.Quickfix],
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
    const version = this.lowReg.getConfig().getVersion();
    if (version === Version.v702 || version === Version.OpenABAP) {
      this.initHighReg();
    }
    return this;
  }

  private listMainForInclude(filename: string | undefined) {
    if (filename === undefined) {
      return [];
    }
    // only initialize this.graph if needed
    if (this.graph === undefined) {
      this.graph = new IncludeGraph(this.lowReg);
    }
    return this.graph.listMainForInclude(filename);
  }

  private containsError(highObj: ABAPObject): boolean {
    for (const file of highObj.getABAPFiles()) {
      for (const statement of file.getStatements()) {
        if (statement.get() instanceof Unknown) {
          return true; // contains parser errors
        }
      }
      if (file.getStructure() === undefined) {
        return true;
      }
    }

    return false;
  }

  public run(lowObj: IObject): Issue[] {
    const ret: Issue[] = [];
    this.counter = 1;

    const version = this.lowReg.getConfig().getVersion();
    if (version !== Version.v702 && version !== Version.OpenABAP) {
      return ret;
    } else if (!(lowObj instanceof ABAPObject)) {
      return ret;
    }

    const highObj = this.highReg.getObject(lowObj.getType(), lowObj.getName());
    if (highObj === undefined || !(highObj instanceof ABAPObject)) {
      return ret;
    }

    let highSyntaxObj = highObj;

    if (this.containsError(highObj)) {
      return ret;
    }

    // for includes do the syntax check via a main program
    if (lowObj instanceof Program && lowObj.isInclude()) {
      const mains = this.listMainForInclude(lowObj.getMainABAPFile()?.getFilename());
      if (mains.length <= 0) {
        return [];
      }
      const f = this.highReg.getFileByName(mains[0]);
      if (f === undefined) {
        return [];
      }
      highSyntaxObj = this.highReg.findObjectForFile(f) as ABAPObject;
    }

    for (const lowFile of lowObj.getABAPFiles()) {
      let highSyntax: ISyntaxResult | undefined = undefined;

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
        // hmm, add some way to disable lazyUnknown() in statement_parser.ts
        // alternatively explicit enable it in vscode, its only relevant when a user is
        // actively editing the files
        continue;
      }

      if (highSyntax === undefined) {
        highSyntax = new SyntaxLogic(this.highReg, highSyntaxObj).run();
      }

      let containsUnknown = false;
      for (let i = 0; i < lowStatements.length; i++) {
        const low = lowStatements[i];
        const high = highStatements[i];
        if ((low.get() instanceof Unknown && !(high.get() instanceof Unknown))
            || high.findFirstExpression(Expressions.InlineData)) {
          containsUnknown = true;

          try {
            const issue = this.checkStatement(low, high, lowFile, highSyntax, highFile);
            if (issue) {
              ret.push(issue);
            }

          } catch (e) {
            if (e instanceof SkipToNextFile) {
              ret.push(e.issue);
              break;
            } else {
              throw e;
            }
          }
        }
      }

      if (ret.length === 0 && containsUnknown) {
// this is a hack in order not to change too many unit tests
        for (let i = 0; i < lowStatements.length; i++) {
          const high = highStatements[i];
          if (high.get() instanceof Statements.Data) {
            const issue = this.anonymousTableType(high, lowFile, highSyntax);
            if (issue) {
              ret.push(issue);
            }
          }
        }
      }

      if (ret.length === 0 && lowFile.getRaw().includes(" xsdbool(")) {
        for (let i = 0; i < lowStatements.length; i++) {
          const high = highStatements[i];
          const issue = this.replaceXsdBool(high, lowFile, highSyntax);
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
    // use default configuration, ie. default target version
    const highConfig = Config.getDefault().get();
    const lowConfig = this.lowReg.getConfig().get();
    highConfig.syntax.errorNamespace = lowConfig.syntax.errorNamespace;
    highConfig.syntax.globalConstants = lowConfig.syntax.globalConstants;
    highConfig.syntax.globalMacros = lowConfig.syntax.globalMacros;
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
  private checkStatement(low: StatementNode, high: StatementNode, lowFile: ABAPFile,
                         highSyntax: ISyntaxResult, highFile: ABAPFile): Issue | undefined {
    if (low.getFirstToken().getStart() instanceof VirtualPosition) {
      return undefined;
    }

    // downport XSDBOOL() early, as it is valid 702 syntax
    /*
    let found = this.replaceXsdBool(high, lowFile, highSyntax);
    if (found) {
      return found;
    }
    */

    let found = this.downportEnum(low, high, lowFile, highSyntax, highFile);
    if (found) {
      return found;
    }

    found = this.partiallyImplemented(high, lowFile);
    if (found) {
      return found;
    }

    found = this.raiseException(high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.emptyKey(low, high, lowFile);
    if (found) {
      return found;
    }

    found = this.stringTemplateAlpha(low, high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.moveWithOperator(low, high, lowFile);
    if (found) {
      return found;
    }

    found = this.moveWithSimpleValue(low, high, lowFile);
    if (found) {
      return found;
    }

    found = this.assignWithTable(low, high, lowFile);
    if (found) {
      return found;
    }

    found = this.downportRefSimple(high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.downportCorrespondingSimple(high, lowFile);
    if (found) {
      return found;
    }

    found = this.downportRef(low, high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.downportLoopGroup(high, lowFile, highSyntax, highFile);
    if (found) {
      return found;
    }

    found = this.callFunctionParameterSimple(high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.moveWithTableTarget(low, high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.downportSelectInline(low, high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.downportSelectExistence(low, high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.downportSQLExtras(low, high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.outlineLoopInput(low, high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.outlineLoopTarget(high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    let skipValue = false;
    let skipReduce = false;
    const valueBody = high.findFirstExpression(Expressions.ValueBody);
    const reduceBody = high.findFirstExpression(Expressions.ReduceBody);
    if (valueBody && reduceBody) {
      const valueToken = valueBody.getFirstToken();
      const reduceToken = reduceBody.getFirstToken();
      if (valueToken.getStart().isBefore(reduceToken.getStart())) {
        skipReduce = true;
      } else {
        skipValue = true;
      }
    }

    if (skipValue !== true) {
      found = this.outlineValue(low, high, lowFile, highSyntax);
      if (found) {
        return found;
      }
    }

    if (skipReduce !== true) {
      found = this.outlineReduce(low, high, lowFile, highSyntax);
      if (found) {
        return found;
      }
    }

    found = this.outlineCorresponding(low, high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.downportSelectFields(low, high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.outlineSwitch(low, high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.outlineFilter(low, high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.outlineCast(low, high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.outlineConv(low, high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.outlineCond(low, high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.outlineCatchSimple(high, lowFile);
    if (found) {
      return found;
    }

    found = this.outlineGetReferenceSimple(high, lowFile);
    if (found) {
      return found;
    }

    found = this.outlineDataSimple(high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.outlineData(high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.outlineFS(low, high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.newToCreateObject(low, high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.replaceLineFunctions(high, lowFile, highSyntax, highFile);
    if (found) {
      return found;
    }

    found = this.getReference(high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.replaceContains(high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.replaceMethodConditional(low, high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.replaceTableExpression(low, high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.replaceAppendExpression(high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.replaceInsertExpression(high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.downportMessage(high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.downportReadTable(high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    return undefined;
  }

//////////////////////////////////////////

  /** removes @'s */
  private downportSQLExtras(low: StatementNode, high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    }

    if (!(high.get() instanceof Statements.Select)
        && !(high.get() instanceof Statements.SelectLoop)
        && !(high.get() instanceof Statements.UpdateDatabase)
        && !(high.get() instanceof Statements.ModifyDatabase)
        && !(high.get() instanceof Statements.DeleteDatabase)
        && !(high.get() instanceof Statements.InsertDatabase)) {
      return undefined;
    }

    let fix: IEdit | undefined = undefined;
    const addFix = (token: AbstractToken) => {
      const add = EditHelper.deleteToken(lowFile, token);
      if (fix === undefined) {
        fix = add;
      } else {
        fix = EditHelper.merge(fix, add);
      }
    };

    const candidates = [high.findAllExpressionsRecursive(Expressions.SQLTarget),
      high.findAllExpressionsRecursive(Expressions.SQLSource),
      high.findAllExpressionsRecursive(Expressions.SQLSourceNoSpace),
      high.findAllExpressionsRecursive(Expressions.SQLSourceSimple)].flat();
    for (const c of candidates.reverse()) {
      if (c.getFirstToken() instanceof WAt
          || c.getFirstToken() instanceof At) {
        const tokens = c.getAllTokens();
        if (tokens[1] instanceof ParenLeftW && tokens[tokens.length - 1] instanceof WParenRightW) {
          const source = c.findDirectExpression(Expressions.Source);
          const uniqueName = this.uniqueName(high.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
          const fix1 = EditHelper.insertAt(lowFile, high.getStart(), `DATA(${uniqueName}) = ${source?.concatTokens()}.\n`);
          const fix2 = EditHelper.replaceRange(lowFile, c.getFirstToken().getStart(), c.getLastToken().getEnd(), "@" + uniqueName);
          const fix = EditHelper.merge(fix2, fix1);
          return Issue.atToken(lowFile, low.getFirstToken(), "SQL, outline complex @", this.getMetadata().key, this.conf.severity, fix);
        } else {
          addFix(c.getFirstToken());
        }
      }
    }

    for (const fieldList of high.findAllExpressionsMulti([Expressions.SQLFieldList, Expressions.SQLFieldListLoop], true)) {
      for (const token of fieldList.getDirectTokens()) {
        if (token.getStr() === ",") {
          addFix(token);
        }
      }
    }

    if (fix !== undefined) {
      return Issue.atToken(lowFile, low.getFirstToken(), "SQL, remove @ and ,", this.getMetadata().key, this.conf.severity, fix);
    }

    for (const c of high.findAllExpressionsRecursive(Expressions.SQLIn)) {
      const children = c.getChildren();
      const first = children[1];
      if (!(first.get() instanceof WParenLeftW)) {
        continue;
      }
      const last = children[children.length - 1];
      if (last.get() instanceof WParenRightW || last.get() instanceof WParenRight) {
        const firstEnd = first.getFirstToken().getEnd();
        const endDelete = new Position(firstEnd.getRow(), firstEnd.getCol() + 1);
        const fix1 = EditHelper.deleteRange(lowFile, firstEnd, endDelete);

        const lastStart = last.getFirstToken().getStart();
        const startDelete = new Position(lastStart.getRow(), lastStart.getCol() - 1);
        const fix2 = EditHelper.deleteRange(lowFile, startDelete, lastStart);
        fix = EditHelper.merge(fix2, fix1);
        return Issue.atToken(lowFile, low.getFirstToken(), "SQL, remove spaces", this.getMetadata().key, this.conf.severity, fix);
      }
    }

    return undefined;
  }

  private downportSelectExistence(low: StatementNode, high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    } else if (!(high.get() instanceof Statements.Select)) {
      return undefined;
    }

    const fieldList = high.findFirstExpression(Expressions.SQLFieldList);
    if (fieldList?.concatTokens().toUpperCase() !== "@ABAP_TRUE") {
      return undefined;
    }
    const fieldName = high.findFirstExpression(Expressions.SQLCond)?.findFirstExpression(Expressions.SQLFieldName)?.concatTokens();
    if (fieldName === undefined) {
      return undefined;
    }
    const into = high.findFirstExpression(Expressions.SQLIntoStructure);
    if (into === undefined) {
      return undefined;
    }
    const intoName = into.findFirstExpression(Expressions.SQLTarget)?.findFirstExpression(Expressions.Target)?.concatTokens();

    const uniqueName = this.uniqueName(high.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
    const fix1 = EditHelper.replaceRange(lowFile, fieldList.getFirstToken().getStart(), fieldList.getLastToken().getEnd(), fieldName);
    const fix2 = EditHelper.replaceRange(lowFile, into?.getFirstToken().getStart(), into?.getLastToken().getEnd(), `INTO @DATA(${uniqueName})`);
    let fix = EditHelper.merge(fix2, fix1);
    const fix3 = EditHelper.insertAt(lowFile, high.getLastToken().getEnd(), `\nCLEAR ${intoName}.\nIF sy-subrc = 0.\n  ${intoName} = abap_true.\nENDIF.`);
    fix = EditHelper.merge(fix, fix3);

    return Issue.atToken(lowFile, low.getFirstToken(), "SQL, refactor existence check", this.getMetadata().key, this.conf.severity, fix);
  }

  private downportSelectInline(low: StatementNode, high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {

    if (!(low.get() instanceof Unknown)) {
      return undefined;
    } else if (!(high.get() instanceof Statements.Select) && !(high.get() instanceof Statements.SelectLoop)) {
      return undefined;
    }

// as first step outline the @DATA, note that void types are okay, as long the field names are specified
    let found = this.downportSelectSingleInline(low, high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.downportSelectTableInline(low, high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    return undefined;
  }

  private downportSelectFields(low: StatementNode, high: StatementNode, lowFile: ABAPFile, _highSyntax: ISyntaxResult): Issue | undefined {

    if (!(low.get() instanceof Unknown)) {
      return undefined;
    } else if (!(high.get() instanceof Statements.Select)) {
      return undefined;
    }

    const fields = high.findFirstExpression(Expressions.SQLFields);
    if (fields === undefined) {
      return undefined;
    }

    const code = fields.getLastChild()?.concatTokens();
    if (code === undefined) {
      return undefined;
    }

    const fix1 = EditHelper.deleteRange(lowFile, fields.getFirstToken().getStart(), fields.getLastToken().getEnd());
    const fix2 = EditHelper.insertAt(lowFile, high.getFirstToken().getEnd(), " " + code);
    const fix = EditHelper.merge(fix1, fix2);
    return Issue.atToken(lowFile, fields.getFirstToken(), "Replace FIELDS", this.getMetadata().key, this.conf.severity, fix);
  }

  private downportSelectSingleInline(low: StatementNode, high: StatementNode,
                                     lowFile: ABAPFile, _highSyntax: ISyntaxResult): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    }

    const targets = high.findFirstExpression(Expressions.SQLIntoStructure)?.findDirectExpressions(Expressions.SQLTarget) || [];
    if (targets.length !== 1) {
      return undefined;
    }

    const inlineData = targets[0].findFirstExpression(Expressions.InlineData);
    if (inlineData === undefined) {
      return undefined;
    }

    const sqlFrom = high.findAllExpressions(Expressions.SQLFromSource);
    if (sqlFrom.length !== 1) {
      return undefined;
    }

    const tableName = sqlFrom[0].findDirectExpression(Expressions.DatabaseTable)?.concatTokens();
    if (tableName === undefined) {
      return undefined;
    }

    const indentation = " ".repeat(high.getFirstToken().getStart().getCol() - 1);
    let fieldList = high.findFirstExpression(Expressions.SQLFieldList);
    if (fieldList === undefined) {
      fieldList = high.findFirstExpression(Expressions.SQLFieldListLoop);
    }
    if (fieldList === undefined) {
      return undefined;
    }
    let fieldDefinition = "";
    const fields = fieldList.findAllExpressions(Expressions.SQLFieldName);
    const name = inlineData.findFirstExpression(Expressions.TargetField)?.concatTokens() || "error";
    if (fields.length === 1) {
      fieldDefinition = `DATA ${name} TYPE ${tableName}-${fields[0].concatTokens()}.`;
    } else if (fieldList.concatTokens() === "*") {
      fieldDefinition = `DATA ${name} TYPE ${tableName}.`;
    } else if (fieldList.concatTokens().toUpperCase() === "COUNT( * )") {
      fieldDefinition = `DATA ${name} TYPE i.`;
    } else if (fieldList.concatTokens().toUpperCase() === "@ABAP_TRUE"
        || fieldList.concatTokens().toUpperCase() === "@ABAP_FALSE") {
      fieldDefinition = `DATA ${name} TYPE abap_bool.`;
    } else if (fieldList.getChildren().length === 1 && fieldList.getChildren()[0].get() instanceof Expressions.SQLAggregation) {
      const c = fieldList.getChildren()[0];
      if (c instanceof ExpressionNode) {
        const concat = c.findFirstExpression(Expressions.SQLArithmetics)?.concatTokens();
        fieldDefinition = `DATA ${name} TYPE ${tableName}-${concat}.`;
      }
    } else {
      for (const f of fields) {
        const fieldName = f.concatTokens();
        fieldDefinition += indentation + "        " + fieldName + " TYPE " + tableName + "-" + fieldName + ",\n";
      }
      fieldDefinition = `DATA: BEGIN OF ${name},
${fieldDefinition}${indentation}      END OF ${name}.`;
    }

    const fix1 = EditHelper.insertAt(lowFile, high.getStart(), `${fieldDefinition}
${indentation}`);
    const fix2 = EditHelper.replaceRange(lowFile, inlineData.getFirstToken().getStart(), inlineData.getLastToken().getEnd(), name);
    const fix = EditHelper.merge(fix2, fix1);

    return Issue.atToken(lowFile, inlineData.getFirstToken(), "Outline SELECT @DATA", this.getMetadata().key, this.conf.severity, fix);
  }

  private downportSelectTableInline(low: StatementNode, high: StatementNode,
                                    lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    }

    const targets = high.findFirstExpression(Expressions.SQLIntoTable)?.findDirectExpressions(Expressions.SQLTarget) || [];
    if (targets.length !== 1) {
      return undefined;
    }
    const indentation = " ".repeat(high.getFirstToken().getStart().getCol() - 1);

    const inlineData = targets[0].findFirstExpression(Expressions.InlineData);
    if (inlineData === undefined) {
      return undefined;
    }

    const sqlFrom = high.findAllExpressions(Expressions.SQLFromSource);
    if (sqlFrom.length === 0) {
      return Issue.atToken(lowFile, high.getFirstToken(), "Error outlining, sqlFrom not found", this.getMetadata().key, this.conf.severity);
    }

    let tableName = sqlFrom[0].findDirectExpression(Expressions.DatabaseTable)?.concatTokens();
    if (tableName === undefined) {
      return undefined;
    }

    const fieldList = high.findFirstExpression(Expressions.SQLFieldList);
    if (fieldList === undefined) {
      return undefined;
    }
    let fieldDefinitions = "";
    for (const f of fieldList.findAllExpressions(Expressions.SQLFieldName)) {
      let fieldName = f.concatTokens();
      if (fieldName.includes("~")) {
        const split = fieldName.split("~");
        tableName = split[0];
        fieldName = split[1];
      }
      fieldDefinitions += indentation + "        " + fieldName + " TYPE " + tableName + "-" + fieldName + ",\n";
    }

    const uniqueName = this.uniqueName(high.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
    const name = inlineData.findFirstExpression(Expressions.TargetField)?.concatTokens() || "error";

    let fix1 = EditHelper.insertAt(lowFile, high.getStart(), `TYPES: BEGIN OF ${uniqueName},
${fieldDefinitions}${indentation}      END OF ${uniqueName}.
${indentation}DATA ${name} TYPE STANDARD TABLE OF ${uniqueName} WITH DEFAULT KEY.
${indentation}`);
    if (fieldDefinitions === "") {
      fix1 = EditHelper.insertAt(lowFile, high.getStart(), `DATA ${name} TYPE STANDARD TABLE OF ${tableName} WITH DEFAULT KEY.
${indentation}`);
    }

    const fix2 = EditHelper.replaceRange(lowFile, inlineData.getFirstToken().getStart(), inlineData.getLastToken().getEnd(), name);
    const fix = EditHelper.merge(fix2, fix1);

    return Issue.atToken(lowFile, inlineData.getFirstToken(), "Outline SELECT @DATA", this.getMetadata().key, this.conf.severity, fix);
  }

  // the anonymous type minght be used in inferred type statements, define it so it can be referred
  private anonymousTableType(high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(high.get() instanceof Statements.Data)) {
      return undefined;
    }

    const tt = high.findFirstExpression(Expressions.TypeTable);
    if (tt === undefined) {
      return undefined;
    }

    const uniqueName = this.uniqueName(high.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
    const code = `TYPES ${uniqueName} ${tt.concatTokens()}.\n`;

    const fix1 = EditHelper.insertAt(lowFile, high.getStart(), code);
    const fix2 = EditHelper.replaceRange(lowFile, tt.getFirstToken().getStart(), tt.getLastToken().getEnd(), "TYPE " + uniqueName);
    const fix = EditHelper.merge(fix2, fix1);
    return Issue.atToken(lowFile, high.getFirstToken(), "Add type for table definition", this.getMetadata().key, this.conf.severity, fix);
  }

  private downportMessage(high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(high.get() instanceof Statements.Message)) {
      return undefined;
    }
    const foundWith = high.findExpressionAfterToken("WITH");
    if (foundWith === undefined) {
      return undefined;
    }
    const likeSource = high.findExpressionAfterToken("LIKE");

    for (const s of high.findAllExpressions(Expressions.Source)) {
      if (s === likeSource) {
        continue;
      } else if (s.getChildren().length === 1 && s.getFirstChild()?.get() instanceof Expressions.Constant) {
        continue;
      } else if (s.getChildren().length === 1 && s.getFirstChild()?.get() instanceof Expressions.FieldChain) {
        continue;
      }
      const uniqueName = this.uniqueName(high.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
      const indentation = " ".repeat(high.getFirstToken().getStart().getCol() - 1);
      const firstToken = high.getFirstToken();
      const code = `DATA(${uniqueName}) = ${s.concatTokens()}.\n${indentation}`;
      const fix1 = EditHelper.insertAt(lowFile, firstToken.getStart(), code);
      const fix2 = EditHelper.replaceRange(lowFile, s.getFirstToken().getStart(), s.getLastToken().getEnd(), uniqueName);
      const fix = EditHelper.merge(fix2, fix1);
      return Issue.atToken(lowFile, high.getFirstToken(), "Refactor MESSAGE WITH source", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private replaceAppendExpression(high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(high.get() instanceof Statements.Append)) {
      return undefined;
    }

    const children = high.getChildren();
    if (children[1].get() instanceof Expressions.Source) {
      const source = children[1];
      const target = high.findDirectExpression(Expressions.Target);
      if (target === undefined) {
        return undefined;
      }

      const uniqueName = this.uniqueName(high.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
      const indentation = " ".repeat(high.getFirstToken().getStart().getCol() - 1);
      const firstToken = high.getFirstToken();
      const fix1 = EditHelper.insertAt(lowFile, firstToken.getStart(), `DATA ${uniqueName} LIKE LINE OF ${target?.concatTokens()}.
${indentation}${uniqueName} = ${source.concatTokens()}.\n${indentation}`);
      const fix2 = EditHelper.replaceRange(lowFile, source.getFirstToken().getStart(), source.getLastToken().getEnd(), uniqueName);
      const fix = EditHelper.merge(fix2, fix1);

      return Issue.atToken(lowFile, high.getFirstToken(), "Outline APPEND source expression", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private downportReadTable(high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(high.get() instanceof Statements.ReadTable)) {
      return undefined;
    }

    const source = high.findExpressionAfterToken("TABLE");
    if (source?.get() instanceof Expressions.Source) {
      const uniqueName = this.uniqueName(high.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
      const indentation = " ".repeat(high.getFirstToken().getStart().getCol() - 1);
      const firstToken = high.getFirstToken();
      const fix1 = EditHelper.insertAt(lowFile, firstToken.getStart(), `DATA(${uniqueName}) = ${source.concatTokens()}.\n` + indentation);
      const fix2 = EditHelper.replaceRange(lowFile, source.getFirstToken().getStart(), source.getLastToken().getEnd(), uniqueName);
      const fix = EditHelper.merge(fix2, fix1);
      return Issue.atToken(lowFile, high.getFirstToken(), "Outline table source", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private replaceInsertExpression(high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(high.get() instanceof Statements.InsertInternal)) {
      return undefined;
    }

    const children = high.getChildren();
    if (children[1].get() instanceof Expressions.Source) {
      const source = children[1];
      const target = high.findDirectExpression(Expressions.Target);
      if (target === undefined) {
        return undefined;
      }

      const uniqueName = this.uniqueName(high.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
      const indentation = " ".repeat(high.getFirstToken().getStart().getCol() - 1);
      const firstToken = high.getFirstToken();
      const fix1 = EditHelper.insertAt(lowFile, firstToken.getStart(), `DATA ${uniqueName} LIKE LINE OF ${target?.concatTokens()}.
${indentation}${uniqueName} = ${source.concatTokens()}.\n${indentation}`);
      const fix2 = EditHelper.replaceRange(lowFile, source.getFirstToken().getStart(), source.getLastToken().getEnd(), uniqueName);
      const fix = EditHelper.merge(fix2, fix1);

      return Issue.atToken(lowFile, high.getFirstToken(), "Outline INSERT source expression", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private replaceTableExpression(low: StatementNode, high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    }

    for (const fieldChain of high.findAllExpressionsRecursive(Expressions.FieldChain)) {
      const tableExpression = fieldChain.findDirectExpression(Expressions.TableExpression);
      if (tableExpression === undefined) {
        continue;
      }

      const concat = high.concatTokens().toUpperCase();
      if (concat.includes(" LINE_EXISTS( ") || concat.includes(" LINE_INDEX( ")) {
        // note: line_exists() must be replaced before handling table expressions
        continue;
      }

      let pre = "";
      let startToken: AbstractToken | undefined = undefined;
      for (const child of fieldChain.getChildren()) {
        if (startToken === undefined) {
          startToken = child.getFirstToken();
        } else if (child === tableExpression) {
          break;
        }
        pre += child.concatTokens();
      }
      if (startToken === undefined) {
        continue;
      }

      const condition = this.tableCondition(tableExpression);

      const uniqueName = this.uniqueName(high.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
      const tabixBackup = this.uniqueName(high.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
      const indentation = " ".repeat(high.getFirstToken().getStart().getCol() - 1);
      const firstToken = high.getFirstToken();
      // note that the tabix restore should be done before throwing the exception
      const fix1 = EditHelper.insertAt(lowFile, firstToken.getStart(), `DATA ${uniqueName} LIKE LINE OF ${pre}.
${indentation}DATA ${tabixBackup} LIKE sy-tabix.
${indentation}${tabixBackup} = sy-tabix.
${indentation}READ TABLE ${pre} ${condition}INTO ${uniqueName}.
${indentation}sy-tabix = ${tabixBackup}.
${indentation}IF sy-subrc <> 0.
${indentation}  RAISE EXCEPTION TYPE cx_sy_itab_line_not_found.
${indentation}ENDIF.
${indentation}`);
      const fix2 = EditHelper.replaceRange(lowFile, startToken.getStart(), tableExpression.getLastToken().getEnd(), uniqueName);
      const fix = EditHelper.merge(fix2, fix1);

      if (high.get() instanceof Statements.ElseIf) {
        throw "downport, unable to downport table expression in ELSEIF";
      }

      return Issue.atToken(lowFile, high.getFirstToken(), "Outline table expression", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private tableCondition(tableExpression: ExpressionNode) {
    let condition = "";
    let keyName = "";
    for (const c of tableExpression.getChildren() || []) {
      if (c.getFirstToken().getStr() === "[" || c.getFirstToken().getStr() === "]") {
        continue;
      } else if (c.get() instanceof Expressions.ComponentChainSimple && condition === "") {
        if (keyName === "") {
          condition = "WITH KEY ";
        } else {
          condition = "WITH TABLE KEY " + keyName + " COMPONENTS ";
        }
      } else if (c.get() instanceof Expressions.Source && condition === "") {
        condition = "INDEX ";
      } else if (c instanceof TokenNode && c.getFirstToken().getStr().toUpperCase() === "KEY") {
        continue;
      } else if (c.get() instanceof Expressions.SimpleName) {
        keyName = c.concatTokens();
        continue;
      }
      condition += c.concatTokens() + " ";
    }
    return condition;
  }

  private outlineCatchSimple(node: StatementNode, lowFile: ABAPFile): Issue | undefined {
    // outlines "CATCH cx_bcs INTO DATA(lx_bcs_excep).", note that this does not need to look at types

    if (!(node.get() instanceof Statements.Catch)) {
      return undefined;
    }

    const target = node.findFirstExpression(Expressions.Target);
    if (!(target?.getFirstChild()?.get() instanceof Expressions.InlineData)) {
      return undefined;
    }

    const classNames = node.findDirectExpressions(Expressions.ClassName);
    if (classNames.length !== 1) {
      return undefined;
    }
    const className = classNames[0].concatTokens();

    const targetName = target.findFirstExpression(Expressions.TargetField)?.concatTokens();
    const indentation = " ".repeat(node.getFirstToken().getStart().getCol() - 1);

    const code = `  DATA ${targetName} TYPE REF TO ${className}.
${indentation}CATCH ${className} INTO ${targetName}.`;

    const fix = EditHelper.replaceRange(lowFile, node.getStart(), node.getEnd(), code);

    return Issue.atToken(lowFile, node.getFirstToken(), "Outline DATA", this.getMetadata().key, this.conf.severity, fix);
  }

  private outlineGetReferenceSimple(node: StatementNode, lowFile: ABAPFile): Issue | undefined {
    if (!(node.get() instanceof Statements.GetReference)) {
      return undefined;
    }

    const target = node.findFirstExpression(Expressions.Target);
    if (!(target?.getFirstChild()?.get() instanceof Expressions.InlineData)) {
      return undefined;
    }

    const source = node.findFirstExpression(Expressions.Source);
    if (!(source?.getFirstChild()?.get() instanceof Expressions.FieldChain)) {
      return undefined;
    }

    const targetName = target.findFirstExpression(Expressions.TargetField)?.concatTokens() || "errorError";
    const indentation = " ".repeat(node.getFirstToken().getStart().getCol() - 1);
    const firstToken = target.getFirstToken();
    const lastToken = target.getLastToken();
    const fix1 = EditHelper.insertAt(lowFile, node.getStart(), `DATA ${targetName} LIKE REF TO ${source.concatTokens()}.\n${indentation}`);
    const fix2 = EditHelper.replaceRange(lowFile, firstToken.getStart(), lastToken.getEnd(), targetName);
    const fix = EditHelper.merge(fix2, fix1);

    return Issue.atToken(lowFile, node.getFirstToken(), "Outline DATA", this.getMetadata().key, this.conf.severity, fix);
  }

  private outlineDataSimple(node: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(node.get() instanceof Statements.Move)) {
      return undefined;
    }

    const target = node.findFirstExpression(Expressions.Target);
    if (!(target?.getFirstChild()?.get() instanceof Expressions.InlineData)) {
      return undefined;
    }

    let type = "";
    const source = node.findFirstExpression(Expressions.Source);
    if (source === undefined) {
      return undefined;
    } else if (source.getChildren().length !== 1) {
      return undefined;
    } else if (!(source.getFirstChild()?.get() instanceof Expressions.FieldChain)) {
      return undefined;
    } else if (source.findFirstExpression(Expressions.FieldOffset)) {
      return undefined;
    } else if (source.findFirstExpression(Expressions.FieldLength)) {
      return undefined;
    } else if (source.findFirstExpression(Expressions.TableExpression)) {
      const chain = source.findDirectExpression(Expressions.FieldChain);
      if (chain !== undefined
          && chain.getChildren().length === 2
          && chain.getChildren()[0].get() instanceof Expressions.SourceField
          && chain.getChildren()[1].get() instanceof Expressions.TableExpression) {
        type = "LINE OF " + chain.getChildren()[0].concatTokens();
      } else {
        return undefined;
      }
    } else {
      const spag = highSyntax.spaghetti.lookupPosition(source.getFirstToken().getStart(), lowFile.getFilename());
      if (spag) {
        const found = spag.findVariable(source.concatTokens());
        if (found && found.getType().isGeneric() === true) {
          return undefined;
        }
      }

      type = source.concatTokens();
    }

    const targetName = target.findFirstExpression(Expressions.TargetField)?.concatTokens();
    const indentation = " ".repeat(node.getFirstToken().getStart().getCol() - 1);
    const firstToken = node.getFirstToken();
    const lastToken = node.getLastToken();
    const fix1 = EditHelper.insertAt(lowFile, firstToken.getStart(), `DATA ${targetName} LIKE ${type}.\n${indentation}`);
    const fix2 = EditHelper.replaceRange(lowFile, firstToken.getStart(), lastToken.getEnd(), `${targetName} = ${source.concatTokens()}.`);
    const fix = EditHelper.merge(fix2, fix1);

    return Issue.atToken(lowFile, node.getFirstToken(), "Outline DATA", this.getMetadata().key, this.conf.severity, fix);
  }

  private partiallyImplemented(node: StatementNode, lowFile: ABAPFile): Issue | undefined {

    if (node.get() instanceof Statements.InterfaceDef) {
      const partially = node.findDirectTokenByText("PARTIALLY");
      if (partially === undefined) {
        return undefined;
      }
      const implemented = node.findDirectTokenByText("IMPLEMENTED");
      if (implemented === undefined) {
        return undefined;
      }
      const fix = EditHelper.deleteRange(lowFile, partially.getStart(), implemented.getEnd());
      return Issue.atToken(lowFile, partially, "Downport PARTIALLY IMPLEMENTED", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private raiseException(node: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {

    /*
    Note: IF_T100_DYN_MSG does not exist in 702, so this rule is mostly relevant for the transpiler

    DATA foo LIKE if_t100_message=>t100key.
    foo-msgid = 'ZHVAM'.
    foo-msgno = '001'.
    foo-attr1 = 'IF_T100_DYN_MSG~MSGV1'.
    foo-attr2 = 'IF_T100_DYN_MSG~MSGV2'.
    foo-attr3 = 'IF_T100_DYN_MSG~MSGV3'.
    foo-attr4 = 'IF_T100_DYN_MSG~MSGV4'.
    DATA bar TYPE REF TO zcl_hvam_exception.
    CREATE OBJECT bar EXPORTING textid = foo.
    bar->if_t100_dyn_msg~msgty = 'E'.
    bar->if_t100_dyn_msg~msgv1 = 'abc'.
    bar->if_t100_dyn_msg~msgv2 = 'abc'.
    bar->if_t100_dyn_msg~msgv3 = 'abc'.
    bar->if_t100_dyn_msg~msgv4 = 'abc'.
    RAISE EXCEPTION bar.
    */

    if (!(node.get() instanceof Statements.Raise)) {
      return undefined;
    }

    let id: string | undefined = undefined;
    let number: string | undefined = undefined;

    let startToken = node.findDirectTokenByText("ID");
    if (startToken) {
      const sources = node.findDirectExpressions(Expressions.Source);
      id = sources[0].concatTokens();
      const numberExpression = node.findExpressionAfterToken("NUMBER");
      if (numberExpression === undefined) {
        throw "downport raiseException, could not find number";
      }
      number = numberExpression.concatTokens();
      if (numberExpression.get() instanceof Expressions.MessageNumber) {
        number = "'" + number + "'";
      }
    } else {
      const s = node.findDirectExpression(Expressions.MessageSource);
      if (s === undefined) {
        return undefined;
      }

      if (s.findDirectExpression(Expressions.MessageClass)) {
        id = "'" + s.findDirectExpression(Expressions.MessageClass)?.concatTokens()?.toUpperCase() + "'";
      } else {
        id = s.findExpressionAfterToken("ID")?.concatTokens();
      }

      if (s.findDirectExpression(Expressions.MessageTypeAndNumber)) {
        number = "'" + s.findDirectExpression(Expressions.MessageTypeAndNumber)?.concatTokens().substring(1) + "'";
      } else {
        number = s.findExpressionAfterToken("NUMBER")?.concatTokens();
      }

      startToken = node.getFirstToken();
    }

    const withs = node.findDirectExpression(Expressions.RaiseWith)?.findDirectExpressions(Expressions.Source) || [];

    const className = node.findDirectExpression(Expressions.ClassName)?.concatTokens() || "ERROR";

    const uniqueName1 = this.uniqueName(node.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
    const uniqueName2 = this.uniqueName(node.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
    const indentation = " ".repeat(node.getFirstToken().getStart().getCol() - 1);

    let abap = `DATA ${uniqueName1} LIKE if_t100_message=>t100key.
${indentation}${uniqueName1}-msgid = ${id}.
${indentation}${uniqueName1}-msgno = ${number}.\n`;
    if (withs.length > 0) {
      abap += `${indentation}${uniqueName1}-attr1 = 'IF_T100_DYN_MSG~MSGV1'.
${indentation}${uniqueName1}-attr2 = 'IF_T100_DYN_MSG~MSGV2'.
${indentation}${uniqueName1}-attr3 = 'IF_T100_DYN_MSG~MSGV3'.
${indentation}${uniqueName1}-attr4 = 'IF_T100_DYN_MSG~MSGV4'.\n`;
    }
    abap += `${indentation}DATA ${uniqueName2} TYPE REF TO ${className}.
${indentation}CREATE OBJECT ${uniqueName2} EXPORTING textid = ${uniqueName1}.\n`;
    if (withs.length > 0) {
      abap += `${indentation}${uniqueName2}->if_t100_dyn_msg~msgty = 'E'.\n`;
    }
    let count = 1;
    for (const w of withs) {
      abap += `${indentation}${uniqueName2}->if_t100_dyn_msg~msgv${count} = ${w.concatTokens()}.\n`;
      count++;
    }

    abap += `${indentation}RAISE EXCEPTION ${uniqueName2}.`;

    const fix = EditHelper.replaceRange(lowFile, node.getStart(), node.getEnd(), abap);
    return Issue.atToken(lowFile, startToken, "Downport RAISE MESSAGE", this.getMetadata().key, this.conf.severity, fix);
  }

  private emptyKey(low: StatementNode, node: StatementNode, lowFile: ABAPFile): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    }

    for (let i of node.findAllExpressions(Expressions.TypeTable)) {
      const key = i.findDirectExpression(Expressions.TypeTableKey);
      if (key === undefined) {
        continue;
      }
      i = key;
      const concat = i.concatTokens();
      if (concat.toUpperCase().includes("WITH EMPTY KEY") === false) {
        continue;
      }
      const token = i.findDirectTokenByText("EMPTY");
      if (token === undefined) {
        continue;
      }

      const fix = EditHelper.replaceToken(lowFile, token, "DEFAULT");
      return Issue.atToken(lowFile, i.getFirstToken(), "Downport EMPTY KEY", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private callFunctionParameterSimple(high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(high.get() instanceof Statements.CallFunction)) {
      return undefined;
    }

    let found: ExpressionNode | undefined = undefined;
    for (const p of high.findAllExpressions(Expressions.FunctionExportingParameter)) {
      found = p.findDirectExpression(Expressions.Source);
      if (found && (found.findDirectExpression(Expressions.FieldChain)
          || found.findDirectExpression(Expressions.Constant)
          || found.findDirectExpression(Expressions.TextElement))) {
// its actually simple, ok
        found = undefined;
      } else if (found !== undefined) {
        break;
      }
    }
    if (found === undefined) {
      return undefined;
    }

    const uniqueName = this.uniqueName(high.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);

    const code = `DATA(${uniqueName}) = ${found.concatTokens()}.\n`;

    const fix1 = EditHelper.insertAt(lowFile, high.getFirstToken().getStart(), code);
    const fix2 = EditHelper.replaceRange(lowFile, found.getFirstToken().getStart(), found.getLastToken().getEnd(), uniqueName);
    const fix = EditHelper.merge(fix2, fix1);

    return Issue.atToken(lowFile, high.getFirstToken(), "Downport, call function parameter", this.getMetadata().key, this.conf.severity, fix);
  }

  private downportCorrespondingSimple(high: StatementNode, lowFile: ABAPFile): Issue | undefined {
    if (!(high.get() instanceof Statements.Move)
        || high.getChildren().length !== 4
        || high.getChildren()[2].getFirstToken().getStr().toUpperCase() !== "CORRESPONDING") {
      return undefined;
    }

    const target = high.findDirectExpression(Expressions.Target);
    if (target === undefined) {
      return undefined;
    }

    const sourceRef = high.findFirstExpression(Expressions.Source)?.findFirstExpression(Expressions.CorrespondingBody);
    if (sourceRef?.getChildren().length === 1 && target.concatTokens().toUpperCase().startsWith("DATA(") === false) {
      const code = `MOVE-CORRESPONDING ${sourceRef.concatTokens()} TO ${target.concatTokens()}`;

      const start = high.getFirstToken().getStart();
      const end = high.getLastToken().getStart();
      const fix = EditHelper.replaceRange(lowFile, start, end, code);

      return Issue.atToken(lowFile, high.getFirstToken(), "Downport, simple CORRESPONDING move", this.getMetadata().key, this.conf.severity, fix);
    } else if (sourceRef?.getChildren().length === 5 && sourceRef.getFirstChild()?.concatTokens().toUpperCase() === "BASE") {
      let code = `${target.concatTokens()} = ${sourceRef.getChildren()[2].concatTokens()}.\n`;
      code += `MOVE-CORRESPONDING ${sourceRef.getChildren()[4].concatTokens()} TO ${target.concatTokens()}`;

      const start = high.getFirstToken().getStart();
      const end = high.getLastToken().getStart();
      const fix = EditHelper.replaceRange(lowFile, start, end, code);

      return Issue.atToken(lowFile, high.getFirstToken(), "Downport, CORRESPONDING BASE move", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private downportRefSimple(high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(high.get() instanceof Statements.Move)
        || high.getChildren().length !== 4
        || high.getChildren()[2].getFirstToken().getStr().toUpperCase() !== "REF") {
      return undefined;
    }

    const target = high.findDirectExpression(Expressions.Target);
    if (target === undefined) {
      return undefined;
    }
    const sourceRef = high.findFirstExpression(Expressions.Source)?.findDirectExpression(Expressions.Source);
    if (sourceRef === undefined
        || sourceRef.getChildren().length !== 1 ) {
      return undefined;
    }

    let code = "";
    if (sourceRef.findFirstExpression(Expressions.TableExpression)) {
      const uniqueName = this.uniqueName(high.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
      code = `ASSIGN ${sourceRef.concatTokens()} TO FIELD-SYMBOL(<${uniqueName}>).
IF sy-subrc <> 0.
  RAISE EXCEPTION TYPE cx_sy_itab_line_not_found.
ENDIF.
GET REFERENCE OF <${uniqueName}> INTO ${target.concatTokens()}`;
    } else {
      code = `GET REFERENCE OF ${sourceRef.concatTokens()} INTO ${target.concatTokens()}`;
    }

    const start = high.getFirstToken().getStart();
    const end = high.getLastToken().getStart();
    const fix = EditHelper.replaceRange(lowFile, start, end, code);

    return Issue.atToken(lowFile, high.getFirstToken(), "Downport, simple REF move", this.getMetadata().key, this.conf.severity, fix);
  }

  private downportLoopGroup(high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult, highFile: ABAPFile): Issue | undefined {
    if (!(high.get() instanceof Statements.Loop)) {
      return undefined;
    }
    const group = high.findDirectExpression(Expressions.LoopGroupBy);
    if (group === undefined) {
      return undefined;
    }
    const groupTargetName = group.findFirstExpression(Expressions.TargetField)?.concatTokens()
      || group.findFirstExpression(Expressions.TargetFieldSymbol)?.concatTokens().replace("<", "_").replace(">", "_")
      || "nameNotFound";
    const loopSourceName = high.findFirstExpression(Expressions.SimpleSource2)?.concatTokens() || "nameNotFound";
    const loopTargetName = high.findFirstExpression(Expressions.TargetField)?.concatTokens()
      || high.findFirstExpression(Expressions.TargetFieldSymbol)?.concatTokens()
      || "nameNotFound";
    const groupTarget = group.findDirectExpression(Expressions.LoopGroupByTarget)?.concatTokens() || "";
    const isReference = high.findFirstExpression(Expressions.LoopTarget)?.concatTokens().toUpperCase().startsWith("REFERENCE INTO ");

    let loopSourceRowType = "typeNotFound";
    const spag = highSyntax.spaghetti.lookupPosition(high.getFirstToken().getStart(), lowFile.getFilename());
    if (spag !== undefined) {
      const found = spag.findVariable(loopSourceName);
      const tt = found?.getType();
      if (tt instanceof TableType) {
        loopSourceRowType = tt.getRowType().getQualifiedName() || "typeNotFound";
      }
    }

    let code = `TYPES: BEGIN OF ${groupTargetName}type,\n`;
    let condition = "";
    let groupCountName: string | undefined = undefined;
    let groupIndexName: string | undefined = undefined;
    for (const c of group.findAllExpressions(Expressions.LoopGroupByComponent)) {
      const name = c.findFirstExpression(Expressions.ComponentName);
      let type = c.findFirstExpression(Expressions.Source)?.concatTokens() || "todo";
      if (c.concatTokens()?.toUpperCase().endsWith(" = GROUP SIZE")) {
        type = "i";
        groupCountName = name?.concatTokens();
      } else if (c.concatTokens()?.toUpperCase().endsWith(" = GROUP INDEX")) {
        type = "i";
        groupIndexName = name?.concatTokens();
      } else {
        if (condition !== "") {
          condition += " ";
        }
        condition += c.concatTokens();
        type = type.replace(loopTargetName, loopSourceRowType);
        type = type.replace("->", "-");
      }
      code += `         ${name?.concatTokens()} TYPE ${type},\n`;
    }
    const s = group.findDirectExpression(Expressions.Source);
    let singleName = "";
    if (s) {
      let type = s.concatTokens();
      type = type.replace(loopTargetName, loopSourceRowType);
      type = type.replace("->", "-");
      singleName = s.concatTokens().split("-")[1];
      code += `         ${singleName} TYPE ${type},\n`;
      condition = singleName + " = " + s.concatTokens();
    }

    const uniqueName = this.uniqueName(high.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
    const uniqueFS = this.uniqueName(high.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
    const uniqueNameIndex = this.uniqueName(high.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
    code += `         items LIKE ${loopSourceName},
       END OF ${groupTargetName}type.
DATA ${groupTargetName}tab TYPE STANDARD TABLE OF ${groupTargetName}type WITH DEFAULT KEY.
DATA ${uniqueName} LIKE LINE OF ${groupTargetName}tab.
LOOP AT ${loopSourceName} ${high.findFirstExpression(Expressions.LoopTarget)?.concatTokens()}.\n`;
    if (groupIndexName !== undefined) {
      code += `DATA(${uniqueNameIndex}) = sy-tabix.\n`;
    }
    code += `READ TABLE ${groupTargetName}tab ASSIGNING FIELD-SYMBOL(<${uniqueFS}>) WITH KEY ${condition}.
IF sy-subrc = 0.\n`;
    if (groupCountName !== undefined) {
      code += `  <${uniqueFS}>-${groupCountName} = <${uniqueFS}>-${groupCountName} + 1.\n`;
    }
    code += `  INSERT ${loopTargetName}${isReference ? "->*" : ""} INTO TABLE <${uniqueFS}>-items.
ELSE.\n`;
    code += `  CLEAR ${uniqueName}.\n`;
    for (const c of group.findAllExpressions(Expressions.LoopGroupByComponent)) {
      const concat = c.concatTokens();
//      console.dir(concat);
      if (concat.endsWith(" GROUP INDEX")) {
        code += `  ${uniqueName}-${groupIndexName} = ${uniqueNameIndex}.\n`;
      } else if (concat.endsWith(" GROUP SIZE")) {
        code += `  ${uniqueName}-${groupCountName} = 1.\n`;
      } else {
        code += `  ${uniqueName}-${concat}.\n`;
      }
    }
    if (singleName !== "") {
      code += `  ${uniqueName}-${singleName} = ${loopTargetName}-${singleName}.\n`;
    }
    code += `  INSERT ${loopTargetName}${isReference ? "->*" : ""} INTO TABLE ${uniqueName}-items.\n`;
    code += `  INSERT ${uniqueName} INTO TABLE ${groupTargetName}tab.\n`;
    code += `ENDIF.
ENDLOOP.
LOOP AT ${groupTargetName}tab ${groupTarget}.`;

    let fix = EditHelper.replaceRange(lowFile, high.getFirstToken().getStart(), high.getLastToken().getEnd(), code);

    for (const l of highFile.getStructure()?.findAllStructures(Structures.Loop) || []) {
// make sure to find the correct/current loop statement
      if (l.findDirectStatement(Statements.Loop) !== high) {
        continue;
      }
      for (const loop of l.findAllStatements(Statements.Loop)) {
        if (loop.concatTokens()?.toUpperCase().startsWith("LOOP AT GROUP ")) {
          const subLoopSource = loop.findFirstExpression(Expressions.SimpleSource2);
          if (subLoopSource === undefined) {
            continue;
          }
          const subLoopSourceName = subLoopSource?.concatTokens() || "nameNotFound";
          const subCode = `LOOP AT ${subLoopSourceName}${isReference ? "->" : "-"}items`;
          const subFix = EditHelper.replaceRange(lowFile, loop.getFirstToken().getStart(), subLoopSource.getLastToken().getEnd(), subCode);
          fix = EditHelper.merge(subFix, fix);
        }
      }
    }

    return Issue.atToken(lowFile, high.getFirstToken(), "Downport, LOOP GROUP", this.getMetadata().key, this.conf.severity, fix);
  }

  private downportRef(low: StatementNode, high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    }

    let found: ExpressionNode | undefined = undefined;
    for (const s of high.findAllExpressionsRecursive(Expressions.Source)) {
      if (s.getFirstToken().getStr().toUpperCase() === "REF"
          && s.findDirectExpression(Expressions.TypeNameOrInfer)) {
        found = s;
      }
    }
    if (found === undefined) {
      return undefined;
    }

    const uniqueName = this.uniqueName(high.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);

    const code = `DATA(${uniqueName}) = ${found.concatTokens()}.\n`;

    const fix1 = EditHelper.insertAt(lowFile, high.getFirstToken().getStart(), code);
    const fix2 = EditHelper.replaceRange(lowFile, found.getFirstToken().getStart(), found.getLastToken().getEnd(), uniqueName);
    const fix = EditHelper.merge(fix2, fix1);

    return Issue.atToken(lowFile, high.getFirstToken(), "Downport, REF", this.getMetadata().key, this.conf.severity, fix);
  }

  private assignWithTable(low: StatementNode, high: StatementNode, lowFile: ABAPFile): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    }

    if (!(high.get() instanceof Statements.Assign)) {
      return undefined;
    } else if (high.getChildren().length !== 5) {
      return undefined;
    }

    const fieldChain = high.findDirectExpression(Expressions.AssignSource)?.findDirectExpression(Expressions.Source)?.findDirectExpression(Expressions.FieldChain);
    const tableExpression = fieldChain?.getLastChild();
    if (tableExpression === undefined
        || !(tableExpression.get() instanceof Expressions.TableExpression)
        || !(tableExpression instanceof ExpressionNode)) {
      return undefined;
    }

    let condition = "";
    if (tableExpression.getChildren().length === 3) {
      const index = tableExpression.findDirectExpression(Expressions.Source);
      if (index === undefined) {
        return undefined;
      }
      condition = `INDEX ${index.concatTokens()}`;
    } else {
      let concat = tableExpression.concatTokens();
      concat = concat.substring(2);
      concat = concat.substring(0, concat.length - 2);
      condition = `WITH KEY ${concat}`;
    }

    let pre = "";
    for (const c of fieldChain!.getChildren() ) {
      if (c === tableExpression) {
        break;
      }
      pre += c.concatTokens();
    }

    const fsTarget = high.findDirectExpression(Expressions.FSTarget);
    const code = `READ TABLE ${pre} ${condition} ASSIGNING ${fsTarget?.concatTokens()}.`;

    const fix = EditHelper.replaceRange(lowFile, high.getFirstToken().getStart(), high.getLastToken().getEnd(), code);

    return Issue.atToken(lowFile, high.getFirstToken(), "Downport, ASSIGN table expr", this.getMetadata().key, this.conf.severity, fix);
  }

  private moveWithSimpleValue(low: StatementNode, high: StatementNode, lowFile: ABAPFile): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    }

    if (!(high.get() instanceof Statements.Move)
        || high.getChildren().length !== 4) {
      return undefined;
    }

    const target = high.findDirectExpression(Expressions.Target);
    if (target === undefined) {
      return undefined;
    }
    const source = high.findDirectExpression(Expressions.Source);
    if (source === undefined) {
      return undefined;
    }
    const field = target.findDirectExpression(Expressions.TargetField);
    if (field === undefined) {
      return;
    }
    const valueBody = source.findDirectExpression(Expressions.ValueBody);
    if (valueBody === undefined) {
      return;
    }
    const fieldAssignments = valueBody.findDirectExpressions(Expressions.FieldAssignment);
    if (fieldAssignments.length === 0) {
      return;
    } else if (fieldAssignments.length !== valueBody.getChildren().length) {
      return;
    }

    const indentation = " ".repeat(high.getFirstToken().getStart().getCol() - 1);
    let code = `CLEAR ${target.concatTokens()}.\n`;
    for (const fieldAssignment of fieldAssignments) {
      code += indentation + target.concatTokens() + "-" + fieldAssignment.concatTokens() + `.\n`;
    }
    code = code.trimEnd();

    const start = high.getFirstToken().getStart();
    const end = high.getLastToken().getEnd();
    const fix = EditHelper.replaceRange(lowFile, start, end, code);

    return Issue.atToken(lowFile, high.getFirstToken(), "Downport, simple move", this.getMetadata().key, this.conf.severity, fix);
  }

  // note, downporting ENUM does not give the correct types, but it will work in most cases?
  private downportEnum(_low: StatementNode, high: StatementNode, lowFile: ABAPFile,
                       _highSyntax: ISyntaxResult, highFile: ABAPFile): Issue | undefined {
    if (!(high.get() instanceof Statements.TypeEnumBegin)) {
      return undefined;
    }
    const enumStructure = highFile.getStructure()?.findFirstStructure(Structures.TypeEnum);
    if (enumStructure === undefined) {
      return undefined;
    }
    if (enumStructure.getFirstStatement() !== high) {
      return undefined;
    }

    const enumName = high.findExpressionAfterToken("ENUM")?.concatTokens();
    const structureName = high.findExpressionAfterToken("STRUCTURE")?.concatTokens();

// all ENUMS are char like?
    let code = `TYPES ${enumName} TYPE string.
CONSTANTS: BEGIN OF ${structureName},\n`;
    let count = 1;
    for (const e of enumStructure.findDirectStatements(Statements.TypeEnum).concat(enumStructure.findDirectStatements(Statements.Type))) {
      const name = e.findFirstExpression(Expressions.NamespaceSimpleName)?.concatTokens();
      let value = e.findFirstExpression(Expressions.Value)?.concatTokens();
      if (value === undefined) {
        value = "VALUE '" + count++ + "'";
      }
      code += `             ${name} TYPE ${enumName} ${value},\n`;
    }
    code += `           END OF ${structureName}.`;

    const start = enumStructure.getFirstToken().getStart();
    const end = enumStructure.getLastToken().getEnd();
    const fix = EditHelper.replaceRange(lowFile, start, end, code);

    return Issue.atToken(lowFile, high.getFirstToken(), "Downport ENUM", this.getMetadata().key, this.conf.severity, fix);

  }

  private moveWithTableTarget(low: StatementNode, high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    }

    if (!(high.get() instanceof Statements.Move)) {
      return undefined;
    }

    const target = high.findDirectExpression(Expressions.Target);
    if (target === undefined) {
      return undefined;
    }
    const tableExpression = target.findDirectExpression(Expressions.TableExpression);
    if (tableExpression === undefined) {
      return undefined;
    }
    const index = tableExpression.findDirectExpression(Expressions.Source);
    if (index === undefined) {
      return undefined;
    }

    let uniqueName = this.uniqueName(high.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
    uniqueName = `<${uniqueName}>`;

    const tName = target.concatTokens().split("[")[0];
    const condition = this.tableCondition(tableExpression);

    const tabixBackup = this.uniqueName(high.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
    const indentation = " ".repeat(high.getFirstToken().getStart().getCol() - 1);
    // restore tabix before exeption
    const code = `FIELD-SYMBOLS ${uniqueName} LIKE LINE OF ${tName}.
${indentation}DATA ${tabixBackup} LIKE sy-tabix.
${indentation}${tabixBackup} = sy-tabix.
${indentation}READ TABLE ${tName} ${condition}ASSIGNING ${uniqueName}.
${indentation}sy-tabix = ${tabixBackup}.
${indentation}IF sy-subrc <> 0.
${indentation}  RAISE EXCEPTION TYPE cx_sy_itab_line_not_found.
${indentation}ENDIF.
${indentation}${uniqueName}`;

    const start = target.getFirstToken().getStart();
    const end = tableExpression.findDirectTokenByText("]")?.getEnd();
    if (end === undefined) {
      return undefined;
    }
    const fix = EditHelper.replaceRange(lowFile, start, end, code);

    return Issue.atToken(lowFile, high.getFirstToken(), "Downport, move with table target", this.getMetadata().key, this.conf.severity, fix);
  }

  private moveWithOperator(low: StatementNode, high: StatementNode, lowFile: ABAPFile): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    } else if (!(high.get() instanceof Statements.Move)) {
      return undefined;
    }
    const children = high.getChildren();
    const secondChild = children[1];
    if (secondChild === undefined) {
      return undefined;
    }

    const op = secondChild.getFirstToken();
    let operator = "";
    switch (op.getStr()) {
      case "+":
        operator = " + ";
        break;
      case "-":
        operator = " - ";
        break;
      case "/=":
        operator = " / ";
        break;
      case "*=":
        operator = " * ";
        break;
      case "&&=":
        operator = " && ";
        break;
      default:
        return undefined;
    }

    const target = high.findDirectExpression(Expressions.Target)?.concatTokens();
    if (target === undefined) {
      return;
    }

    const sourceStart = high.findDirectExpression(Expressions.Source)?.getFirstChild()?.getFirstToken().getStart();
    if (sourceStart === undefined) {
      return;
    }

    const fix = EditHelper.replaceRange(lowFile, op.getStart(), sourceStart, "= " + target + operator);

    return Issue.atToken(lowFile, high.getFirstToken(), "Expand operator", this.getMetadata().key, this.conf.severity, fix);
  }

  // must be very simple string templates, like "|{ ls_line-no ALPHA = IN }|"
  private stringTemplateAlpha(low: StatementNode, high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    }

    for (const child of high.findAllExpressionsRecursive(Expressions.StringTemplate)) {
      const templateTokens = child.getChildren();
      if (templateTokens.length !== 3
          || templateTokens[0].getFirstToken().getStr() !== "|{"
          || templateTokens[2].getFirstToken().getStr() !== "}|") {
        continue;
      }

      const templateSource = child.findDirectExpression(Expressions.StringTemplateSource);
      const formatting = templateSource?.findDirectExpression(Expressions.StringTemplateFormatting)?.concatTokens();
      let functionName = "";
      switch (formatting) {
        case "ALPHA = IN":
          functionName = "CONVERSION_EXIT_ALPHA_INPUT";
          break;
        case "ALPHA = OUT":
          functionName = "CONVERSION_EXIT_ALPHA_OUTPUT";
          break;
        default:
          return undefined;
      }

      const indentation = " ".repeat(high.getFirstToken().getStart().getCol() - 1);
      const source = templateSource?.findDirectExpression(Expressions.Source)?.concatTokens();
      const uniqueName = this.uniqueName(high.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);

      const code = `DATA ${uniqueName} TYPE string.
${indentation}CALL FUNCTION '${functionName}'
${indentation}  EXPORTING
${indentation}    input  = ${source}
${indentation}  IMPORTING
${indentation}    output = ${uniqueName}.\n`;
      const fix1 = EditHelper.insertAt(lowFile, high.getFirstToken().getStart(), code);
      const fix2 = EditHelper.replaceRange(lowFile, child.getFirstToken().getStart(), child.getLastToken().getEnd(), uniqueName);
      const fix = EditHelper.merge(fix2, fix1);
      return Issue.atToken(lowFile, high.getFirstToken(), "Downport ALPHA", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;

  }

  private outlineLoopInput(low: StatementNode, high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    } else if (!(high.get() instanceof Statements.Loop)) {
      return undefined;
    } else if (high.findDirectExpression(Expressions.SimpleSource2)) {
      return undefined;
    }

    // the first Source must be outlined
    const s = high.findDirectExpression(Expressions.Source);
    if (s === undefined) {
      return undefined;
    }

    const uniqueName = this.uniqueName(high.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);

    const code = `DATA(${uniqueName}) = ${s.concatTokens()}.\n` +
      " ".repeat(high.getFirstToken().getStart().getCol() - 1);
    const fix1 = EditHelper.insertAt(lowFile, high.getFirstToken().getStart(), code);
    const fix2 = EditHelper.replaceRange(lowFile, s.getFirstToken().getStart(), s.getLastToken().getEnd(), uniqueName);
    const fix = EditHelper.merge(fix2, fix1);

    return Issue.atToken(lowFile, high.getFirstToken(), "Outline LOOP input", this.getMetadata().key, this.conf.severity, fix);
  }

  private outlineLoopTarget(node: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
// also allows outlining of voided types
    if (!(node.get() instanceof Statements.Loop)) {
      return undefined;
    }

    const sourceName = node.findDirectExpression(Expressions.SimpleSource2)?.concatTokens();
    if (sourceName === undefined) {
      return undefined;
    }

    const concat = node.concatTokens().toUpperCase();
    if (concat.includes(" GROUP BY ") || concat.startsWith("LOOP AT GROUP ")) {
      return undefined;
    }
    const isReference = concat.includes(" REFERENCE INTO ");
    const indentation = " ".repeat(node.getFirstToken().getStart().getCol() - 1);

    const dataTarget = node.findDirectExpression(Expressions.LoopTarget)?.findDirectExpression(Expressions.Target)?.findDirectExpression(Expressions.InlineData);
    if (dataTarget) {
      const targetName = dataTarget.findDirectExpression(Expressions.TargetField)?.concatTokens() || "DOWNPORT_ERROR";
      let code = `DATA ${targetName} LIKE LINE OF ${sourceName}.\n${indentation}`;
      if (isReference) {
        const likeName = this.uniqueName(node.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
        code = `DATA ${likeName} LIKE LINE OF ${sourceName}.\n${indentation}DATA ${targetName} LIKE REF TO ${likeName}.\n${indentation}`;
      }
      const fix1 = EditHelper.insertAt(lowFile, node.getFirstToken().getStart(), code);
      const fix2 = EditHelper.replaceRange(lowFile, dataTarget.getFirstToken().getStart(), dataTarget.getLastToken().getEnd(), targetName);
      const fix = EditHelper.merge(fix2, fix1);
      return Issue.atToken(lowFile, node.getFirstToken(), "Outline LOOP data target", this.getMetadata().key, this.conf.severity, fix);
    }

    const fsTarget = node.findDirectExpression(Expressions.LoopTarget)?.findDirectExpression(Expressions.FSTarget)?.findDirectExpression(Expressions.InlineFS);
    if (fsTarget) {
      const targetName = fsTarget.findDirectExpression(Expressions.TargetFieldSymbol)?.concatTokens() || "DOWNPORT_ERROR";
      const code = `FIELD-SYMBOLS ${targetName} LIKE LINE OF ${sourceName}.\n${indentation}`;
      const fix1 = EditHelper.insertAt(lowFile, node.getFirstToken().getStart(), code);
      const fix2 = EditHelper.replaceRange(lowFile, fsTarget.getFirstToken().getStart(), fsTarget.getLastToken().getEnd(), targetName);
      const fix = EditHelper.merge(fix2, fix1);
      return Issue.atToken(lowFile, node.getFirstToken(), "Outline LOOP fs target", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private outlineFor(forLoop: ExpressionNode, indentation: string, lowFile: ABAPFile, highSyntax: ISyntaxResult):
  {body: string, end: string} {
    let body = "";
    let end = "";
    const loopSource = forLoop.findFirstExpression(Expressions.Source)?.concatTokens();

    let loopTargetFieldExpression = forLoop.findFirstExpression(Expressions.TargetField);
    let loopTargetFieldName = loopTargetFieldExpression?.concatTokens();
    const of = forLoop.findExpressionAfterToken("OF");
    if (of !== undefined) {
      loopTargetFieldExpression = of;
      loopTargetFieldName = of?.concatTokens();
    }
    if (forLoop.findDirectExpression(Expressions.InlineLoopDefinition)?.getFirstChild()?.get() instanceof Expressions.TargetFieldSymbol) {
      loopTargetFieldExpression = undefined;
      loopTargetFieldName = undefined;
    }

    if (loopTargetFieldExpression) {
      const start = loopTargetFieldExpression.getFirstToken().getStart();
      const spag = highSyntax.spaghetti.lookupPosition(start, lowFile.getFilename());
      if (loopTargetFieldName && spag) {
        if (new SpagHelper(spag).isDuplicateName(loopTargetFieldName, start)) {
          this.renameVariable(spag, loopTargetFieldName, start, lowFile, highSyntax);
        }
      }
    }

    let cond = forLoop.findDirectExpression(Expressions.ComponentCond)?.concatTokens() || "";
    if (cond !== "") {
      cond = " WHERE " + cond;
    }

    const loop = forLoop.findDirectExpression(Expressions.InlineLoopDefinition);
    const indexInto = loop?.findExpressionAfterToken("INTO")?.concatTokens();

    if (forLoop.findDirectTokenByText("UNTIL")
        || forLoop.findDirectTokenByText("WHILE")) {
      const fieldDef = forLoop.findDirectExpression(Expressions.InlineFieldDefinition);
      const field = fieldDef?.findFirstExpression(Expressions.Field)?.concatTokens();
      const indexBackup = this.uniqueName(forLoop.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
      body += indentation + "DATA " + field + " TYPE i.\n";
      const second = fieldDef?.getChildren()[2];
      if (second?.get() instanceof Expressions.Source) {
        body += indentation + field + " = " + second.concatTokens() + ".\n";
      }

      const not = forLoop.findDirectTokenByText("UNTIL") ? " NOT" : "";
      const cond = forLoop.findFirstExpression(Expressions.Cond);
      body += indentation + `DATA ${indexBackup} LIKE sy-index.\n`;
      body += indentation + `${indexBackup} = sy-index.\n`;
      body += indentation + `WHILE${not} ${cond?.concatTokens()}.\n`;
      body += indentation + `  sy-index = ${indexBackup}.\n`;

      const then = forLoop.findExpressionAfterToken("THEN");
      if (then) {
        end += `  ${field} = ${then.concatTokens()}.\n`;
      } else {
        end += `  ${field} = ${field} + 1.\n`;
      }

      end += indentation + "ENDWHILE";
    } else if (loopTargetFieldName !== undefined) {
      let from = forLoop.findExpressionAfterToken("FROM")?.concatTokens();
      from = from ? " FROM " + from : "";
      let to = forLoop.findExpressionAfterToken("TO")?.concatTokens();
      to = to ? " TO " + to : "";

      let gby = "";
      for (const lg of forLoop.findDirectExpressions(Expressions.LoopGroupByComponent)) {
        if (gby !== "") {
          gby += " ";
        }
        gby += lg.concatTokens();
      }
      if (gby !== "") {
        gby = " GROUP BY ( " + gby + " )";
      }
      const fc = forLoop.findDirectExpression(Expressions.FieldChain);
      if (fc) {
        gby = " GROUP BY " + fc.concatTokens();
      }
      if (forLoop.findDirectTokenByText("ASCENDING")) {
        gby += " ASCENDING";
      }
      if (forLoop.findDirectTokenByText("DESCENDING")) {
        gby += " DESCENDING";
      }

      const groups = forLoop.findExpressionAfterToken("GROUPS");
      if (groups) {
        const concat = groups.concatTokens();
        if (concat.startsWith("<")) {
          gby += " ASSIGNING FIELD-SYMBOL(" + concat + ")";
        } else {
          gby += " INTO DATA(" + concat + ")";
        }
      }

      let inGroup = "";
      if(forLoop.concatTokens().toUpperCase().includes(" IN GROUP ")) {
        inGroup = "-items";
      }

      let into = "INTO DATA";
      if (loopTargetFieldName.startsWith("<")) {
        into = "ASSIGNING FIELD-SYMBOL";
      }
      // todo, also backup sy-index / sy-tabix here?
      body += indentation + `LOOP AT ${loopSource}${inGroup} ${into}(${loopTargetFieldName})${from}${to}${cond}${gby}.\n`;
      if (indexInto) {
        body += indentation + "  DATA(" + indexInto + ") = sy-tabix.\n";
      }
      end = "ENDLOOP";
    } else if (loopTargetFieldName === undefined) {
      // todo, also backup sy-index / sy-tabix here?
      const loopTargetFieldSymbol = forLoop.findFirstExpression(Expressions.TargetFieldSymbol)?.concatTokens();
      body += indentation + `LOOP AT ${loopSource} ASSIGNING FIELD-SYMBOL(${loopTargetFieldSymbol})${cond}.\n`;
      if (indexInto) {
        body += indentation + "  DATA(" + indexInto + ") = sy-tabix.\n";
      }
      end = "ENDLOOP";
    }

    const l = forLoop.findDirectExpression(Expressions.Let);
    if (l) {
      body += this.outlineLet(l, indentation, highSyntax, lowFile);
    }

    return {body, end};
  }

  private outlineFilter(low: StatementNode, high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    }

    for (const i of high.findAllExpressionsRecursive(Expressions.Source)) {
      const firstToken = i.getFirstToken();
      if (firstToken.getStr().toUpperCase() !== "FILTER") {
        continue;
      }

      const filterBody = i.findDirectExpression(Expressions.FilterBody);
      if (filterBody === undefined) {
        continue;
      }

      const sourceName = filterBody.findDirectExpression(Expressions.Source)?.concatTokens();
      if (sourceName === undefined) {
        continue;
      }

      let type = this.findType(i, lowFile, highSyntax);
      if (type === undefined) {
        type = "LIKE " + sourceName;
      } else {
        type = "TYPE " + type;
      }

      const uniqueName = this.uniqueName(firstToken.getStart(), lowFile.getFilename(), highSyntax);
      const loopName = this.uniqueName(firstToken.getStart(), lowFile.getFilename(), highSyntax);
      const indentation = " ".repeat(high.getFirstToken().getStart().getCol() - 1);
      let body = "";

      body += `DATA ${uniqueName} ${type}.\n`;
      body += `${indentation}LOOP AT ${sourceName} INTO DATA(${loopName}) ${filterBody.concatTokens().substring(sourceName.length + 1)}.\n`;
      body += `${indentation}  INSERT ${loopName} INTO TABLE ${uniqueName}.\n`;
      body += `${indentation}ENDLOOP.\n${indentation}`;

      const fix1 = EditHelper.insertAt(lowFile, high.getFirstToken().getStart(), body);
      const fix2 = EditHelper.replaceRange(lowFile, firstToken.getStart(), i.getLastToken().getEnd(), uniqueName);
      const fix = EditHelper.merge(fix2, fix1);

      return Issue.atToken(lowFile, firstToken, "Downport FILTER", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private outlineSwitch(low: StatementNode, high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    }

    for (const i of high.findAllExpressionsRecursive(Expressions.Source)) {
      const firstToken = i.getFirstToken();
      if (firstToken.getStr().toUpperCase() !== "SWITCH") {
        continue;
      }

      let type = this.findType(i, lowFile, highSyntax);
      if (type === undefined) {
        if (high.get() instanceof Statements.Move
            && high.findDirectExpression(Expressions.Source) === i
            && high.findDirectExpression(Expressions.Target)?.findDirectExpression(Expressions.TargetField) !== undefined) {
          type = "LIKE " + high.findDirectExpression(Expressions.Target)?.concatTokens();
        }
        if (type === undefined) {
          continue;
        }
      } else {
        type = "TYPE " + type;
      }

      const uniqueName = this.uniqueName(firstToken.getStart(), lowFile.getFilename(), highSyntax);
      const indentation = " ".repeat(high.getFirstToken().getStart().getCol() - 1);
      let body = "";
      let name = "";

      const switchBody = i.findDirectExpression(Expressions.SwitchBody);
      if (switchBody === undefined) {
        continue;
      }

      for (const l of switchBody?.findDirectExpression(Expressions.Let)?.findDirectExpressions(Expressions.InlineFieldDefinition) || []) {
        name = l.getFirstToken().getStr();
        body += indentation + `DATA(${name}) = ${switchBody.findFirstExpression(Expressions.Source)?.concatTokens()}.\n`;
      }

      body += `DATA ${uniqueName} ${type}.\n`;
      let firstSource = false;
      let inWhen = false;
      for (const c of switchBody.getChildren()) {
        if (c.get() instanceof Expressions.Source && firstSource === false) {
          body += indentation + `CASE ${c.concatTokens()}.`;
          firstSource = true;
        } else if (c instanceof TokenNode && c.concatTokens().toUpperCase() === "THEN") {
          inWhen = true;
          body += ".\n";
        } else if (c instanceof TokenNode && c.concatTokens().toUpperCase() === "WHEN") {
          inWhen = false;
          body += `\n${indentation}  WHEN `;
        } else if (c instanceof TokenNode && c.concatTokens().toUpperCase() === "OR") {
          body += ` OR `;
        } else if (c instanceof TokenNode && c.concatTokens().toUpperCase() === "ELSE") {
          inWhen = true;
          body += `\n${indentation}  WHEN OTHERS.\n`;
        } else if (inWhen === false) {
          body += c.concatTokens();
        } else {
          body += indentation + "    " + uniqueName + " = " + c.concatTokens() + ".";
        }
      }
      body += "\n" + indentation + "ENDCASE.\n" + indentation;

      const fix1 = EditHelper.insertAt(lowFile, high.getFirstToken().getStart(), body);
      const fix2 = EditHelper.replaceRange(lowFile, firstToken.getStart(), i.getLastToken().getEnd(), uniqueName);
      const fix = EditHelper.merge(fix2, fix1);

      return Issue.atToken(lowFile, firstToken, "Downport SWITCH", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private outlineReduce(low: StatementNode, high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    }

    for (const i of high.findAllExpressionsRecursive(Expressions.Source)) {
      const firstToken = i.getFirstToken();
      if (firstToken.getStr().toUpperCase() !== "REDUCE") {
        continue;
      }

      const type = this.findType(i, lowFile, highSyntax);
      if (type === undefined) {
        continue;
      }

      const uniqueName = this.uniqueName(firstToken.getStart(), lowFile.getFilename(), highSyntax);
      const indentation = " ".repeat(high.getFirstToken().getStart().getCol() - 1);
      let body = "";
      let name = "";

      const reduceBody = i.findDirectExpression(Expressions.ReduceBody);
      if (reduceBody === undefined) {
        continue;
      }

      const letNode = reduceBody.findDirectExpression(Expressions.Let);
      if (letNode) {
        body += this.outlineLet(letNode, indentation, highSyntax, lowFile);
      }

      let firstName = "";
      for (const init of reduceBody.findDirectExpressions(Expressions.InlineFieldDefinition)) {
        name = init.getFirstToken().getStr();
        if (firstName === "") {
          firstName = name;
        }

        const spag = highSyntax.spaghetti.lookupPosition(init.getFirstToken().getStart(), lowFile.getFilename());
        if (spag && new SpagHelper(spag).isDuplicateName(name, init.getFirstToken().getStart())) {
          this.renameVariable(spag, name, init.getFirstToken().getStart(), lowFile, highSyntax);
        }

        const s = init.findFirstExpression(Expressions.Source)?.concatTokens();
        const t = init.findFirstExpression(Expressions.TypeName)?.concatTokens();
        if (s) {
          if (s.toUpperCase().startsWith("VALUE #")) {
            body += indentation + `DATA(${name}) = ${s.replace("#", type)}.\n`;
          } else {
            body += indentation + `DATA(${name}) = ${s}.\n`;
          }
        } else {
          body += indentation + `DATA ${name} TYPE ${t}.\n`;
        }
      }

      let end = "";
      for (const forLoop of reduceBody?.findDirectExpressions(Expressions.For) || []) {
        const outlineFor = this.outlineFor(forLoop, indentation, lowFile, highSyntax);
        body += outlineFor.body;
        end = outlineFor.end + `.\n` + end;
      }

      const next = reduceBody.findDirectExpression(Expressions.ReduceNext);
      if (next === undefined) {
        continue;
      }
      for (const n of next.getChildren()) {
        const concat = n.concatTokens();
        if (concat.toUpperCase() === "NEXT") {
          continue;
        } else if (n.get() instanceof Expressions.SimpleTarget) {
          body += indentation + "  " + concat + " ";
        } else if (n.get() instanceof Expressions.Source) {
          body += " " + concat + ".\n";
        } else {
          body += concat;
        }
      }

      body += indentation + end;
      body += indentation + `${uniqueName} = ${firstName}.\n`;

      const abap = `DATA ${uniqueName} TYPE ${type}.\n` +
        body +
        indentation;
      const reduceEnd = i.findDirectTokenByText(")");
      const fix1 = EditHelper.insertAt(lowFile, high.getFirstToken().getStart(), abap);
      const fix2 = EditHelper.replaceRange(lowFile, firstToken.getStart(), reduceEnd!.getEnd(), uniqueName);
      const fix = EditHelper.merge(fix2, fix1);

      return Issue.atToken(lowFile, firstToken, "Downport REDUCE", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private outlineCorresponding(low: StatementNode, high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    }

    const allSources = high.findAllExpressionsRecursive(Expressions.Source);
    for (const s of allSources) {
      const firstToken = s.getFirstToken();
      if (firstToken.getStr().toUpperCase() !== "CORRESPONDING") {
        continue;
      }

      const correspondingBody = s.findDirectExpression(Expressions.CorrespondingBody);

      if (correspondingBody?.getFirstToken().getStr().toUpperCase() === "BASE") {
        continue;
      }

      const uniqueName = this.uniqueName(firstToken.getStart(), lowFile.getFilename(), highSyntax);
      const indentation = " ".repeat(high.getFirstToken().getStart().getCol() - 1);

      let type = this.findType(s, lowFile, highSyntax);
      if (type === undefined) {
        if (high.get() instanceof Statements.Move && high.findDirectExpression(Expressions.Source) === s) {
          type = "LIKE " + high.findDirectExpression(Expressions.Target)?.concatTokens();
        }
        if (type === undefined) {
          continue;
        }
      } else {
        type = "TYPE " + type;
      }

      const abap = `DATA ${uniqueName} ${type}.\n` +
        indentation + `CLEAR ${uniqueName}.\n` + // might be called inside a loop
        indentation + `MOVE-CORRESPONDING ${correspondingBody?.concatTokens()} TO ${uniqueName}.\n` +
        indentation;
      const fix1 = EditHelper.insertAt(lowFile, high.getFirstToken().getStart(), abap);
      const fix2 = EditHelper.replaceRange(lowFile, firstToken.getStart(), s.getLastToken().getEnd(), uniqueName);
      const fix = EditHelper.merge(fix2, fix1);

      return Issue.atToken(lowFile, firstToken, "Downport CORRESPONDING", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private outlineValue(low: StatementNode, high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    }

    const allSources = high.findAllExpressionsRecursive(Expressions.Source);
    for (const s of allSources) {
      const firstToken = s.getFirstToken();
      if (firstToken.getStr().toUpperCase() !== "VALUE") {
        continue;
      }

      const valueBody = s.findDirectExpression(Expressions.ValueBody);

      let type = this.findType(s, lowFile, highSyntax);
      if (type === undefined) {
        if (high.get() instanceof Statements.Move && high.findDirectExpression(Expressions.Source) === s) {
          type = "LIKE " + high.findDirectExpression(Expressions.Target)?.concatTokens();
        }
        if (type === undefined) {
          continue;
        }
      } else {
        type = "TYPE " + type;
      }

      const uniqueName = this.uniqueName(firstToken.getStart(), lowFile.getFilename(), highSyntax);
      let indentation = " ".repeat(high.getFirstToken().getStart().getCol() - 1);
      let body = "";
      const base = valueBody?.findExpressionAfterToken("BASE");
      if (base) {
        body += indentation + uniqueName + " = " + base.concatTokens() + ".\n";
      }
      let end = "";

      let structureName = uniqueName;
      let added = false;
      let data = "";
      let previous: ExpressionNode | TokenNode | undefined = undefined;

      if (valueBody?.findDirectExpression(Expressions.ValueBodyLine) !== undefined) {
        structureName = this.uniqueName(firstToken.getStart(), lowFile.getFilename(), highSyntax);
        const extra = valueBody?.findDirectExpression(Expressions.For) ? "  " : "";
        data = indentation + extra + `DATA ${structureName} LIKE LINE OF ${uniqueName}.\n`;
      }

      for (const a of valueBody?.getChildren() || []) {
        if (a.get() instanceof Expressions.FieldAssignment) {
          if (added === false) {
            body += data;
            added = true;
          }
          body += indentation + structureName + "-" + a.concatTokens() + ".\n";
        } else if (a instanceof ExpressionNode && a.get() instanceof Expressions.For) {
          const outlineFor = this.outlineFor(a, indentation, lowFile, highSyntax);
          body += outlineFor.body;
          end = outlineFor.end + `.\n` + end;
          indentation += "  ";
        } else if (a instanceof ExpressionNode && a.get() instanceof Expressions.Source) {
          // special handling for superflous value expression
          if (valueBody?.getChildren().length === 1) {
            body += indentation + uniqueName + " = " + a.concatTokens() + `.\n`;
          }
        } else if (a instanceof ExpressionNode && a.get() instanceof Expressions.Let) {
          body += this.outlineLet(a, indentation, highSyntax, lowFile);
        }
        if (a instanceof ExpressionNode && a.get() instanceof Expressions.ValueBodyLine) {
          let skip = false;
          for (const b of a?.getChildren() || []) {
            if (b.get() instanceof Expressions.FieldAssignment) {
              if (added === false) {
                body += data;
                added = true;
              }
              body += indentation + structureName + "-" + b.concatTokens() + ".\n";
            } else if (b.get() instanceof Expressions.Source) {
// note: it wont work with APPEND for Hashed/Sorted Tables, so use INSERT,
              body += indentation + "INSERT " + b.concatTokens() + ` INTO TABLE ${uniqueName}.\n`;
              skip = true;
            } else if (b.get() instanceof Expressions.ValueBodyLines) {
              body += indentation + "INSERT " + b.concatTokens() + ` INTO TABLE ${uniqueName}.\n`;
              skip = true;
            } else if (b.concatTokens() === ")") {
              if (added === false && previous?.concatTokens() === "(") {
                body += data;
                added = true;
              }
              if (skip === false) {
                body += indentation + `INSERT ${structureName} INTO TABLE ${uniqueName}.\n`;
              }
            }
            previous = b;
          }
        }
      }

      if (body === "" && valueBody?.getLastChild()?.getFirstToken().getStr().toUpperCase() === "OPTIONAL") {
        const fieldChain = valueBody.findFirstExpression(Expressions.FieldChain);
        const rowName = this.uniqueName(firstToken.getStart(), lowFile.getFilename(), highSyntax);

        let tableExpression: ExpressionNode | undefined = undefined;
        let tabName = "";
        let after = "";
        for (const c of fieldChain?.getChildren() || []) {
          if (c.get() instanceof Expressions.TableExpression && c instanceof ExpressionNode) {
            tableExpression = c;
          } else if (tableExpression === undefined) {
            tabName += c.concatTokens();
          } else {
            after += c.concatTokens();
          }
        }

        let condition = "";
        if (tableExpression?.getChildren().length === 3) {
          condition = "INDEX " + tableExpression?.findDirectExpression(Expressions.Source)?.concatTokens();
        } else {
          condition = "WITH KEY " + tableExpression?.concatTokens().replace("[ ", "").replace(" ]", "");
        }

        body +=
          indentation + `READ TABLE ${tabName} INTO DATA(${rowName}) ${condition}.\n` +
          indentation + `IF sy-subrc = 0.\n` +
          indentation + `  ${uniqueName} = ${rowName}${after}.\n` +
          indentation + `ENDIF.\n`;

        if (type.includes("LIKE DATA(")) {
          type = `LIKE LINE OF ${tabName}`;
        }
      }

      if (end !== "") {
        indentation = indentation.substring(2);
        body += indentation + end;
      }

      const abap = `DATA ${uniqueName} ${type}.\n` +
        indentation + `CLEAR ${uniqueName}.\n` + // might be called inside a loop
        body +
        indentation;
      const fix1 = EditHelper.insertAt(lowFile, high.getFirstToken().getStart(), abap);
      const fix2 = EditHelper.replaceRange(lowFile, firstToken.getStart(), s.getLastToken().getEnd(), uniqueName);
      const fix = EditHelper.merge(fix2, fix1);

      return Issue.atToken(lowFile, firstToken, "Downport VALUE", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private outlineLet(node: ExpressionNode, indentation: string, highSyntax: ISyntaxResult, lowFile: ABAPFile): string {
    let ret = "";
    for (const f of node.findDirectExpressions(Expressions.InlineFieldDefinition)) {
      const c = f.getFirstChild();
      if (c === undefined) {
        continue;
      }
      const name = c.concatTokens().toLowerCase();

      const spag = highSyntax.spaghetti.lookupPosition(c.getFirstToken().getStart(), lowFile.getFilename());
      if (spag === undefined) {
        continue;
      }

      if (new SpagHelper(spag).isDuplicateName(name, c.getFirstToken().getStart())) {
        this.renameVariable(spag, name, c.getFirstToken().getStart(), lowFile, highSyntax);
      }

      const found = spag.findVariable(name);
      if (found === undefined) {
        const source = f.findFirstExpression(Expressions.Source);
        if (source) {
          ret += indentation + "DATA(" + name + `) = ${source.concatTokens()}.\n`;
        }
        continue;
      }
      const type = found.getType().getQualifiedName() ? found.getType().getQualifiedName()?.toLowerCase() : found.getType().toABAP();

      ret += indentation + "DATA " + name + ` TYPE ${type}.\n`;

      const source = f.findFirstExpression(Expressions.Source);
      if (source) {
        ret += indentation + name + ` = ${source.concatTokens()}.\n`;
      }
    }
    return ret;
  }

  private renameVariable(spag: ISpaghettiScopeNode, name: string, pos: Position, lowFile: ABAPFile, highSyntax: ISyntaxResult) {
    const newName = this.uniqueName(pos, lowFile.getFilename(), highSyntax);
    const fix = new SpagHelper(spag).renameVariable(name, pos, lowFile, newName);
    const issue = Issue.atPosition(lowFile, pos, "Rename before outline", this.getMetadata().key, this.conf.severity, fix);
    throw new SkipToNextFile(issue);
  }

  private findType(i: ExpressionNode, lowFile: ABAPFile, highSyntax: ISyntaxResult, ref = false): string | undefined {
    const expr = i.findDirectExpression(Expressions.TypeNameOrInfer);
    if (expr === undefined) {
      return undefined;
    }
    const firstToken = expr.getFirstToken();

    const concat = expr.concatTokens().toLowerCase();
    if (concat !== "#") {
      return ref ? "REF TO " + concat : concat;
    }

    const spag = highSyntax.spaghetti.lookupPosition(firstToken.getStart(), lowFile.getFilename());
    if (spag === undefined) {
      return undefined;
    }

    let inferred: TypedIdentifier | undefined = undefined;
    for (const r of spag?.getData().references || []) {
      if (r.referenceType === ReferenceType.InferredType
          && r.resolved
          && r.position.getStart().equals(firstToken.getStart())
          && r.resolved instanceof TypedIdentifier) {
        inferred = r.resolved;
        break;
      }
    }
    if (inferred === undefined) {
      return undefined;
    }

    if (inferred.getType() instanceof ObjectReferenceType) {
      return inferred.getType().toABAP();
    } else {
      return inferred.getType().getQualifiedName()?.toLowerCase();
    }
  }

  private outlineFS(low: StatementNode, high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(low.get() instanceof Unknown)
        || (high.get() instanceof Statements.Loop)) {
      return undefined;
    }

    for (const i of high.findAllExpressionsRecursive(Expressions.InlineFS)) {
      const nameToken = i.findDirectExpression(Expressions.TargetFieldSymbol)?.getFirstToken();
      if (nameToken === undefined) {
        continue;
      }
      const name = nameToken.getStr();

      let type = "";
      if (high.concatTokens().toUpperCase().startsWith("APPEND INITIAL LINE TO ")) {
        type = "LIKE LINE OF " + high.findFirstExpression(Expressions.Target)?.concatTokens();
      } else {
        const spag = highSyntax.spaghetti.lookupPosition(nameToken.getStart(), lowFile.getFilename());
        if (spag === undefined) {
          continue;
        }
        const found = spag.findVariable(name);
        if (found === undefined) {
          continue;
        } else if (found.getType() instanceof VoidType) {
          return Issue.atToken(lowFile, i.getFirstToken(), "Error outlining voided type", this.getMetadata().key, this.conf.severity);
        }
        type = "TYPE ";
        type += found.getType().getQualifiedName() ? found.getType().getQualifiedName()!.toLowerCase() : found.getType().toABAP();
      }

      const code = `FIELD-SYMBOLS ${name} ${type}.\n` +
        " ".repeat(high.getFirstToken().getStart().getCol() - 1);
      const fix1 = EditHelper.insertAt(lowFile, high.getFirstToken().getStart(), code);
      const fix2 = EditHelper.replaceRange(lowFile, i.getFirstToken().getStart(), i.getLastToken().getEnd(), name);
      const fix = EditHelper.merge(fix2, fix1);

      return Issue.atToken(lowFile, i.getFirstToken(), "Outline FIELD-SYMBOL", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private outlineData(node: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    // hmm, no guard here, as DATA(SDF) is valid in 702

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
      } else if (found.getType() instanceof VoidType && found.getType().getQualifiedName() === undefined) {
        continue;
      } else if (found.getType() instanceof StructureType && found.getType().getQualifiedName() === undefined) {
        continue;
      }

      let type = found.getType().getQualifiedName()
        ? found.getType().getQualifiedName()?.toLowerCase()
        : found.getType().toABAP();
      if (found.getType() instanceof ObjectReferenceType) {
        type = found.getType().toABAP();
      }
      if (type === "") {
        continue;
      }

      const code = `DATA ${name} TYPE ${type}.\n` +
        " ".repeat(node.getFirstToken().getStart().getCol() - 1);
      const fix1 = EditHelper.insertAt(lowFile, node.getFirstToken().getStart(), code);
      const fix2 = EditHelper.replaceRange(lowFile, i.getFirstToken().getStart(), i.getLastToken().getEnd(), name);
      const fix = EditHelper.merge(fix2, fix1);

      return Issue.atToken(lowFile, i.getFirstToken(), "Outline DATA", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private outlineCond(low: StatementNode, high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    }

    for (const i of high.findAllExpressionsRecursive(Expressions.Source)) {
      if (i.getFirstToken().getStr().toUpperCase() !== "COND") {
        continue;
      }

      const body = i.findDirectExpression(Expressions.CondBody);
      if (body === undefined) {
        continue;
      }

      const uniqueName = this.uniqueName(i.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
      let type = this.findType(i, lowFile, highSyntax);
      if (type === undefined) {
        if (high.get() instanceof Statements.Move
            && high.findDirectExpression(Expressions.Source) === i
            && high.findDirectExpression(Expressions.Target)?.findDirectExpression(Expressions.TargetField) !== undefined) {
          type = "LIKE " + high.findDirectExpression(Expressions.Target)?.concatTokens();
        }
        if (type === undefined) {
          continue;
        }
      } else {
        type = "TYPE " + type;
      }

      const indent = " ".repeat(high.getFirstToken().getStart().getCol() - 1);
      const bodyCode = this.buildCondBody(body, uniqueName, indent, lowFile, highSyntax);

      const last = i.findDirectTokenByText(")")!;

      const abap = `DATA ${uniqueName} ${type}.\n` + bodyCode;
      const fix1 = EditHelper.insertAt(lowFile, high.getFirstToken().getStart(), abap);
      const fix2 = EditHelper.replaceRange(lowFile, i.getFirstToken().getStart(), last.getEnd(), uniqueName);
      const fix = EditHelper.merge(fix2, fix1);
      return Issue.atToken(lowFile, i.getFirstToken(), "Downport COND", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private buildCondBody(body: ExpressionNode, uniqueName: string, indent: string, lowFile: ABAPFile, highSyntax: ISyntaxResult) {
    let code = "";

    let first = true;
    let addElse = true;
    for (const c of body.getChildren()) {
      if (c instanceof TokenNode) {
        switch (c.getFirstToken().getStr().toUpperCase()) {
          case "WHEN":
            if (first === true) {
              code += indent + "IF ";
              first = false;
            } else {
              code += indent + "ELSEIF ";
            }
            break;
          case "THEN":
            code += ".\n";
            break;
          case "ELSE":
            code += indent + "ELSE.\n";
            addElse = false;
            break;
          default:
            throw "buildCondBody, unexpected token";
        }
      } else if (c.get() instanceof Expressions.Cond) {
        code += c.concatTokens();
      } else if (c.get() instanceof Expressions.Let) {
        code += this.outlineLet(c, indent, highSyntax, lowFile);
      } else if (c.get() instanceof Expressions.Source) {
        code += indent + "  " + uniqueName + " = " + c.concatTokens() + ".\n";
      } else if (c.get() instanceof Expressions.Throw) {
        code += indent + "  " + c.concatTokens().replace(/THROW /i, "RAISE EXCEPTION NEW ") + ".\n";
      } else {
        throw "buildCondBody, unexpected expression, " + c.get().constructor.name;
      }
    }
    if (addElse) {
      // COND might be called inside a loop
      code += indent + "ELSE.\n";
      code += indent + `  CLEAR ${uniqueName}.\n`;
    }

    code += indent + "ENDIF.\n";

    code += indent;
    return code;
  }

  private outlineConv(low: StatementNode, high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    }

    for (const i of high.findAllExpressionsRecursive(Expressions.Source)) {
      if (i.getFirstToken().getStr().toUpperCase() !== "CONV") {
        continue;
      }
      const end = i.findDirectTokenByText(")");
      if (end === undefined) {
        continue;
      }

      const body = i.findDirectExpression(Expressions.ConvBody)?.concatTokens();
      if (body === undefined) {
        continue;
      }

      const uniqueName = this.uniqueName(i.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
      const type = this.findType(i, lowFile, highSyntax);
      const indent = " ".repeat(high.getFirstToken().getStart().getCol() - 1);

      const abap = `DATA ${uniqueName} TYPE ${type}.\n` +
        indent + `${uniqueName} = ${body}.\n` +
        indent;
      const fix1 = EditHelper.insertAt(lowFile, high.getFirstToken().getStart(), abap);
      const fix2 = EditHelper.replaceRange(lowFile, i.getFirstToken().getStart(), end.getEnd(), uniqueName);
      const fix = EditHelper.merge(fix2, fix1);

      return Issue.atToken(lowFile, i.getFirstToken(), "Downport CONV", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  // "CAST" to "?="
  private outlineCast(low: StatementNode, high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    }

    for (const i of high.findAllExpressionsRecursive(Expressions.Cast)) {
      const uniqueName = this.uniqueName(i.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
      const type = this.findType(i, lowFile, highSyntax, true);
      const body = i.findDirectExpression(Expressions.Source)?.concatTokens();

      const abap = `DATA ${uniqueName} TYPE ${type}.\n` +
        " ".repeat(high.getFirstToken().getStart().getCol() - 1) +
        `${uniqueName} ?= ${body}.\n` +
        " ".repeat(high.getFirstToken().getStart().getCol() - 1);
      const fix1 = EditHelper.insertAt(lowFile, high.getFirstToken().getStart(), abap);
      const fix2 = EditHelper.replaceRange(lowFile, i.getFirstToken().getStart(), i.getLastToken().getEnd(), uniqueName);
      const fix = EditHelper.merge(fix2, fix1);

      return Issue.atToken(lowFile, i.getFirstToken(), "Downport CAST", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private uniqueName(position: Position, filename: string, highSyntax: ISyntaxResult): string {
    const spag = highSyntax.spaghetti.lookupPosition(position, filename);
    if (spag === undefined) {
      const name = "temprr" + this.counter;
      this.counter++;
      return name;
    }

    let postfix = "";
    if(spag.getIdentifier().stype === ScopeType.ClassDefinition) {
// try making sure this name is not used in subclasses
      const hash = crypto.createHash("sha1").update(spag.getIdentifier().sname).digest("hex");
      postfix = "_" + hash.substring(0, 10);
    }

    while (true) {
      const name = "temp" + this.counter + postfix;
      const exists = this.existsRecursive(spag, name);
      this.counter++;
      if (exists === false) {
        return name;
      }
    }
  }

  // todo, optimize, the findVariable() and findType() does a lot of redundant checks
  private existsRecursive(spag: ISpaghettiScopeNode, name: string): boolean {
    const existsDirect = spag.findVariable(name) || spag.findType(name);
    if (existsDirect) {
      return true;
    }

    for (const child of spag.getChildren()) {
      if (child.findVariable(name) || child.findType(name) || this.existsRecursive(child, name)) {
        return true;
      }
    }

    return false;
  }

  private replaceXsdBool(node: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    const spag = highSyntax.spaghetti.lookupPosition(node.getFirstToken().getStart(), lowFile.getFilename());

    for (const r of spag?.getData().references || []) {
      if (r.referenceType === ReferenceType.BuiltinMethodReference
          && r.position.getName().toUpperCase() === "XSDBOOL") {
        const token = r.position.getToken();

        let source: ExpressionNode | undefined = undefined;
        for (const s of node.findAllExpressionsRecursive(Expressions.Source)) {
          if (s.getFirstToken().getStart().equals(token.getStart())) {
            source = s;
            break;
          }
        }
        const children = source?.getChildren();
        if (source === undefined || children?.length !== 4) {
          continue;
        }

        // make sure to convert to the correct type, RTTI might be used on the result of XSDBOOL
        const code = "CONV xsdboolean( boolc( " + children[2].concatTokens() + " ) )";
        const fix = EditHelper.replaceRange(lowFile, source.getFirstToken().getStart(), source.getLastToken().getEnd(), code);
        return Issue.atToken(lowFile, token, "Use BOOLC", this.getMetadata().key, this.conf.severity, fix);
      }
    }

    return undefined;
  }

  private findMethodCallExpression(node: StatementNode, token: AbstractToken) {
    for (const m of node.findAllExpressions(Expressions.MethodCall)) {
      if (m.findDirectExpression(Expressions.MethodName)?.getFirstToken().getStart().equals(token.getStart())) {
        return m;
      }
    }
    return undefined;
  }

  private replaceMethodConditional(low: StatementNode, high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    }

    for (const c of high.findAllExpressionsRecursive(Expressions.Compare)) {
      const chain = c.findDirectExpression(Expressions.MethodCallChain);
      if (chain === undefined) {
        continue;
      }

      const concat = chain.concatTokens().toUpperCase();
      if (concat.startsWith("LINE_EXISTS( ") || concat.startsWith("LINE_INDEX( ")) {
        // these are handled separately
        continue;
      }

      let predicate = false;
      const spag = highSyntax.spaghetti.lookupPosition(high.getFirstToken().getStart(), lowFile.getFilename());
      for (const r of spag?.getData().references || []) {
        if (r.referenceType === ReferenceType.BuiltinMethodReference &&
              new BuiltIn().isPredicate(chain.getFirstToken().getStr().toUpperCase())) {
          predicate = true;
          break;
        }
      }

      const end = chain.getLastToken().getEnd();
      let fix = EditHelper.insertAt(lowFile, end, " IS NOT INITIAL");
      if (predicate === true) {
        fix = EditHelper.insertAt(lowFile, end, " ) = abap_true");
        const fix1 = EditHelper.insertAt(lowFile, chain.getFirstToken().getStart(), "boolc( ");
        fix = EditHelper.merge(fix, fix1);
      }
      return Issue.atToken(lowFile, chain.getFirstToken(), "Downport method conditional", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private getReference(node: StatementNode, lowFile: ABAPFile, _highSyntax: ISyntaxResult): Issue | undefined {
    if (!(node.get() instanceof Statements.GetReference)) {
      return undefined;
    }

    const inline = node.findDirectExpression(Expressions.Target)?.findDirectExpression(Expressions.InlineData);
    if (inline === undefined) {
      return undefined;
    }
    const targetName = inline.findDirectExpression(Expressions.TargetField)?.concatTokens();
    const sourceName = node.findDirectExpression(Expressions.Source)?.concatTokens();
    if (targetName === undefined || sourceName === undefined) {
      return undefined;
    }

    const code = `DATA ${targetName} LIKE REF TO ${sourceName}.\n`;
    const fix1 = EditHelper.insertAt(lowFile, node.getFirstToken().getStart(), code);
    const fix2 = EditHelper.replaceRange(lowFile, inline.getFirstToken().getStart(), inline.getLastToken().getEnd(), targetName);
    const fix = EditHelper.merge(fix2, fix1);
    return Issue.atToken(lowFile, inline.getFirstToken(), "Downport, outline DATA ref", this.getMetadata().key, this.conf.severity, fix);

  }

  private replaceContains(node: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    const spag = highSyntax.spaghetti.lookupPosition(node.getFirstToken().getStart(), lowFile.getFilename());

    // only downport if its an single method call condition
    let found = false;
    for (const c of node.findAllExpressionsRecursive(Expressions.Compare)) {
      found = c.findDirectExpression(Expressions.MethodCallChain) !== undefined;
      if (found === true) {
        break;
      }
    }
    if (found === false) {
      return undefined;
    }

    for (const r of spag?.getData().references || []) {
      if (r.referenceType !== ReferenceType.BuiltinMethodReference) {
        continue;
      }
      const func = r.position.getName().toUpperCase();
      if (func === "CONTAINS") {
        const token = r.position.getToken();

        const expression = this.findMethodCallExpression(node, token);
        if (expression === undefined) {
          continue;
        }

        const sList = expression.findAllExpressions(Expressions.Source).map(e => e.concatTokens());
        if (sList.length !== 2) {
          continue;
        }

        const code = sList[0] + " CS " + sList[1];
        const start = expression.getFirstToken().getStart();
        const end = expression.getLastToken().getEnd();
        const fix = EditHelper.replaceRange(lowFile, start, end, code);

        return Issue.atToken(lowFile, token, "Downport contains()", this.getMetadata().key, this.conf.severity, fix);
      }
    }

    return undefined;
  }

  private replaceLineFunctions(node: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult, highFile: ABAPFile): Issue | undefined {
    const spag = highSyntax.spaghetti.lookupPosition(node.getFirstToken().getStart(), lowFile.getFilename());

    for (const r of spag?.getData().references || []) {
      if (r.referenceType !== ReferenceType.BuiltinMethodReference) {
        continue;
      }
      const func = r.position.getName().toUpperCase();
      if (func === "LINE_EXISTS" || func === "LINE_INDEX") {
        const token = r.position.getToken();

        const expression = this.findMethodCallExpression(node, token);
        if (expression === undefined) {
          continue;
        }

        let condition = "";
        for (const c of expression?.findFirstExpression(Expressions.TableExpression)?.getChildren() || []) {
          if (c.getFirstToken().getStr() === "[" || c.getFirstToken().getStr() === "]") {
            continue;
          } else if (c.get() instanceof Expressions.ComponentChainSimple && condition === "") {
            condition = "WITH KEY ";
          } else if (c.get() instanceof Expressions.Source && condition === "") {
            condition = "INDEX ";
          }
          condition += c.concatTokens() + " ";
        }

        const tableName = expression.findFirstExpression(Expressions.Source)?.concatTokens().split("[")[0];

        const uniqueName = this.uniqueName(node.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
        const indentation = " ".repeat(node.getFirstToken().getStart().getCol() - 1);

        const sy = func === "LINE_EXISTS" ? "sy-subrc" : "sy-tabix";

        const code = `DATA ${uniqueName} LIKE sy-subrc.\n` +
          indentation + `READ TABLE ${tableName} ${condition}TRANSPORTING NO FIELDS.\n` +
          indentation + uniqueName + ` = ${sy}.\n` +
          indentation ;
        let insertAt: Position | undefined = node.getFirstToken().getStart();
        if (node.get() instanceof ElseIf) {
          // assumption: no side effects in IF conditions
          insertAt = this.findStartOfIf(node, highFile);
          if (insertAt === undefined) {
            continue;
          }
        }
        const fix1 = EditHelper.insertAt(lowFile, insertAt, code);
        const start = expression.getFirstToken().getStart();
        const end = expression.getLastToken().getEnd();
        const fix2 = EditHelper.replaceRange(lowFile, start, end, uniqueName + (func === "LINE_EXISTS" ? " = 0" : ""));
        const fix = EditHelper.merge(fix2, fix1);

        return Issue.atToken(lowFile, token, "Replace line function", this.getMetadata().key, this.conf.severity, fix);
      }
    }

    return undefined;
  }

  private findStartOfIf(node: StatementNode, highFile: ABAPFile): Position | undefined {
    const structure = highFile.getStructure();

    for (const c of structure?.findAllStructuresRecursive(Structures.If) || []) {
      for (const ei of c.findDirectStructures(Structures.ElseIf)) {
        if (ei.getFirstStatement() === node) {
          return c.getFirstToken().getStart();
        }
      }
    }

    return undefined;
  }

  private newToCreateObject(low: StatementNode, high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    }

    const source = high.findDirectExpression(Expressions.Source);

    let fix: IEdit | undefined = undefined;
    if (high.get() instanceof Statements.Move
        && source
        && source.getFirstToken().getStr().toUpperCase() === "NEW") {
      const target = high.findDirectExpression(Expressions.Target);
      const found = source?.findFirstExpression(Expressions.NewObject);
      // must be at top level of the source for quickfix to work(todo: handle more scenarios)
      if (target
          && found
          && source.concatTokens() === found.concatTokens()
          && target.findDirectExpression(Expressions.InlineData) === undefined) {
        const abap = this.newParameters(found, target.concatTokens(), highSyntax, lowFile);
        if (abap !== undefined) {
          fix = EditHelper.replaceRange(lowFile, high.getFirstToken().getStart(), high.getLastToken().getEnd(), abap);
        }
      }
    }

    if (fix === undefined && high.findAllExpressions(Expressions.NewObject)) {
      const found = high.findFirstExpression(Expressions.NewObject);
      if (found === undefined) {
        return undefined;
      }
      const name = this.uniqueName(found.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
      const abap = this.newParameters(found, name, highSyntax, lowFile);
      if (abap === undefined) {
        return undefined;
      }

      const type = this.findType(found, lowFile, highSyntax);
      const indentation = " ".repeat(high.getFirstToken().getStart().getCol() - 1);

      const data = `DATA ${name} TYPE REF TO ${type}.\n` +
        indentation + abap + "\n" +
        indentation;
      if (found.getFirstToken().getStart().equals(high.getFirstToken().getStart())
          && found.getLastToken().getEnd().equals(high.getLastToken().getStart())) {
// full statement = standalone NEW expression
        fix = EditHelper.replaceRange(lowFile, high.getFirstToken().getStart(), high.getLastToken().getEnd(), abap);
      } else {
        const fix1 = EditHelper.insertAt(lowFile, high.getFirstToken().getStart(), data);
        const fix2 = EditHelper.replaceRange(lowFile, found.getFirstToken().getStart(), found.getLastToken().getEnd(), name);
        fix = EditHelper.merge(fix2, fix1);
      }
    }

    if (fix) {
      return Issue.atToken(lowFile, high.getFirstToken(), "Use CREATE OBJECT instead of NEW", this.getMetadata().key, this.conf.severity, fix);
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

        if (cdef && cdef.getMethodDefinitions === undefined) {
          return undefined; // something wrong
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
