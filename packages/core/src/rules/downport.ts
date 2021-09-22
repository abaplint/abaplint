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
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {VoidType} from "../abap/types/basic";
import {Config} from "../config";
import {Token} from "../abap/1_lexer/tokens/_token";
import {WAt} from "../abap/1_lexer/tokens";

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
      extendedInformation: `Much like the 'commented_code' rule this rule loops through unknown statements and tries parsing with
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
* VALUE # with structure fields
* VALUE # with internal table lines
* Table Expressions[ index ] are outlined
* SELECT INTO @DATA definitions are outlined
* Some occurrences of string template formatting option ALPHA changed to function module call
* SELECT/INSERT/MODIFY/DELETE/UPDATE "," in field list removed, "@" in source/targets removed

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
    const version = this.lowReg.getConfig().getVersion();
    if (version === Version.v702 || version === Version.OpenABAP) {
      this.initHighReg();
    }
    return this;
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
  private checkStatement(low: StatementNode, high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    if (low.getFirstToken().getStart() instanceof VirtualPosition) {
      return undefined;
    }

    let found = this.emptyKey(high, lowFile);
    if (found) {
      return found;
    }

    found = this.stringTemplateAlpha(high, lowFile);
    if (found) {
      return found;
    }

    found = this.downportSelectInline(low, high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.downportSQLExtras(low, high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.outlineLoopInput(high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.outlineLoopTarget(high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    found = this.outlineValue(high, lowFile, highSyntax);
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

    found = this.outlineDataSimple(high, lowFile);
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

    found = this.replaceXsdBool(high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    // todo, line_exists() should be replaced before this call
    found = this.replaceTableExpression(high, lowFile, highSyntax);
    if (found) {
      return found;
    }

    // todo, add more rules here

    return undefined;
  }

//////////////////////////////////////////

  private downportSQLExtras(low: StatementNode, high: StatementNode, lowFile: ABAPFile, _highSyntax: ISyntaxResult): Issue | undefined {
    if (!(low.get() instanceof Unknown)) {
      return undefined;
    }
    // todo: update + modify + insert + delete + select loop
    if (!(high.get() instanceof Statements.Select)) {
      return undefined;
    }

    let fix: IEdit | undefined = undefined;
    const addFix = (token: Token) => {
      const add = EditHelper.deleteToken(lowFile, token);
      if (fix === undefined) {
        fix = add;
      } else {
        fix = EditHelper.merge(fix, add);
      }
    };

    const candidates = [high.findAllExpressionsRecursive(Expressions.SQLTarget),
      high.findAllExpressionsRecursive(Expressions.SQLSource),
      high.findAllExpressionsRecursive(Expressions.SQLSourceSimple)].flat();
    for (const c of candidates) {
      if (c.getFirstToken() instanceof WAt) {
        addFix(c.getFirstToken());
      }
    }

    for (const fieldList of high.findAllExpressionsRecursive(Expressions.SQLFieldList)) {
      for (const token of fieldList.getDirectTokens()) {
        if (token.getStr() === ",") {
          addFix(token);
        }
      }
    }

    if (fix === undefined) {
      return undefined;
    } else {
      return Issue.atToken(lowFile, low.getFirstToken(), "SQL, remove \" and ,", this.getMetadata().key, this.conf.severity, fix);
    }
  }

  private downportSelectInline(low: StatementNode, high: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {

    if (!(low.get() instanceof Unknown)
        || !(high.get() instanceof Statements.Select)) {
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

  private downportSelectSingleInline(_low: StatementNode, high: StatementNode,
                                     lowFile: ABAPFile, _highSyntax: ISyntaxResult): Issue | undefined {
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
    const fieldList = high.findFirstExpression(Expressions.SQLFieldList);
    if (fieldList === undefined) {
      return undefined;
    }
    let fieldDefinition = "";
    const fields = fieldList.findDirectExpressions(Expressions.SQLFieldName);
    const name = inlineData.findFirstExpression(Expressions.TargetField)?.concatTokens() || "error";
    if (fields.length === 1) {
      fieldDefinition = `DATA ${name} TYPE ${tableName}-${fields[0].concatTokens()}.`;
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

  private downportSelectTableInline(_low: StatementNode, high: StatementNode,
                                    lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    const targets = high.findFirstExpression(Expressions.SQLIntoTable)?.findDirectExpressions(Expressions.SQLTarget) || [];
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
    const fieldList = high.findFirstExpression(Expressions.SQLFieldList);
    if (fieldList === undefined) {
      return undefined;
    }
    let fieldDefinitions = "";
    for (const f of fieldList.findDirectExpressions(Expressions.SQLFieldName)) {
      const fieldName = f.concatTokens();
      fieldDefinitions += indentation + "        " + fieldName + " TYPE " + tableName + "-" + fieldName + ",\n";
    }

    const uniqueName = this.uniqueName(high.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
    const name = inlineData.findFirstExpression(Expressions.TargetField)?.concatTokens() || "error";
    const fix1 = EditHelper.insertAt(lowFile, high.getStart(), `TYPES: BEGIN OF ${uniqueName},
${fieldDefinitions}${indentation}      END OF ${uniqueName}.
${indentation}DATA ${name} TYPE STANDARD TABLE OF ${uniqueName} WITH DEFAULT KEY.
${indentation}`);
    const fix2 = EditHelper.replaceRange(lowFile, inlineData.getFirstToken().getStart(), inlineData.getLastToken().getEnd(), name);
    const fix = EditHelper.merge(fix2, fix1);

    return Issue.atToken(lowFile, inlineData.getFirstToken(), "Outline SELECT @DATA", this.getMetadata().key, this.conf.severity, fix);
  }

  private replaceTableExpression(node: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {

    for (const fieldChain of node.findAllExpressionsRecursive(Expressions.FieldChain)) {
      const tableExpression = fieldChain.findDirectExpression(Expressions.TableExpression);
      if (tableExpression === undefined) {
        continue;
      }
      if (tableExpression.getChildren().length > 3) {
// for now, only support the INDEX scenario
        continue;
      }

      let pre = "";
      let startToken: Token | undefined = undefined;
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

      const uniqueName = this.uniqueName(node.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);
      const indentation = " ".repeat(node.getFirstToken().getStart().getCol() - 1);
      const firstToken = node.getFirstToken();
      const fix1 = EditHelper.insertAt(lowFile, firstToken.getStart(), `DATA ${uniqueName} LIKE LINE OF ${pre}.
${indentation}READ TABLE ${pre} INDEX ${tableExpression.findFirstExpression(Expressions.Source)?.concatTokens()} INTO ${uniqueName}.
${indentation}IF sy-subrc <> 0.
${indentation}  RAISE EXCEPTION TYPE cx_sy_itab_line_not_found.
${indentation}ENDIF.
${indentation}`);
      const fix2 = EditHelper.replaceRange(lowFile, startToken.getStart(), tableExpression.getLastToken().getEnd(), uniqueName);
      const fix = EditHelper.merge(fix2, fix1);

      return Issue.atToken(lowFile, node.getFirstToken(), "Outline table expression", this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private outlineDataSimple(node: StatementNode, lowFile: ABAPFile): Issue | undefined {
    // outlines "DATA(ls_msg) = temp1.", note that this does not need to look at types

    if (!(node.get() instanceof Statements.Move)) {
      return undefined;
    }

    const target = node.findFirstExpression(Expressions.Target);
    if (!(target?.getFirstChild()?.get() instanceof Expressions.InlineData)) {
      return undefined;
    }

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
    }

    const targetName = target.findFirstExpression(Expressions.TargetField)?.concatTokens();
    const indentation = " ".repeat(node.getFirstToken().getStart().getCol() - 1);
    const firstToken = node.getFirstToken();
    const lastToken = node.getLastToken();
    const fix1 = EditHelper.insertAt(lowFile, firstToken.getStart(), `DATA ${targetName} LIKE ${source.concatTokens()}.\n${indentation}`);
    const fix2 = EditHelper.replaceRange(lowFile, firstToken.getStart(), lastToken.getEnd(), `${targetName} = ${source.concatTokens()}.`);
    const fix = EditHelper.merge(fix2, fix1);

    return Issue.atToken(lowFile, node.getFirstToken(), "Outline DATA", this.getMetadata().key, this.conf.severity, fix);
  }

  private emptyKey(node: StatementNode, lowFile: ABAPFile): Issue | undefined {

    for (let i of node.findAllExpressions(Expressions.TypeTable)) {
      const key = i.findDirectExpression(Expressions.TypeTableKey);
      if (key === undefined) {
        continue;
      }
      i = key;
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

    return undefined;
  }

  // must be very simple string templates, like "|{ ls_line-no ALPHA = IN }|"
  private stringTemplateAlpha(node: StatementNode, lowFile: ABAPFile): Issue | undefined {
    if (!(node.get() instanceof Statements.Move)) {
      return undefined;
    }
    const topSource = node.findDirectExpression(Expressions.Source);
    if (topSource === undefined || topSource.getChildren().length !== 1) {
      return undefined;
    }
    const child = topSource.getFirstChild()! as ExpressionNode;
    if (!(child.get() instanceof Expressions.StringTemplate)) {
      return undefined;
    }
    const templateTokens = child.getChildren();
    if (templateTokens.length !== 3
        || templateTokens[0].getFirstToken().getStr() !== "|{"
        || templateTokens[2].getFirstToken().getStr() !== "}|") {
      return undefined;
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

    const indentation = " ".repeat(node.getFirstToken().getStart().getCol() - 1);
    const source = templateSource?.findDirectExpression(Expressions.Source)?.concatTokens();
    const topTarget = node.findDirectExpression(Expressions.Target)?.concatTokens();

    const code = `CALL FUNCTION '${functionName}'
${indentation}  EXPORTING
${indentation}    input  = ${source}
${indentation}  IMPORTING
${indentation}    output = ${topTarget}.`;
    const fix = EditHelper.replaceRange(lowFile, node.getFirstToken().getStart(), node.getLastToken().getEnd(), code);

    return Issue.atToken(lowFile, node.getFirstToken(), "Downport ALPHA", this.getMetadata().key, this.conf.severity, fix);
  }

  private outlineLoopInput(node: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {

    if (!(node.get() instanceof Statements.Loop)) {
      return undefined;
    } else if (node.findDirectExpression(Expressions.SimpleSource2)) {
      return undefined;
    }

    // the first Source must be outlined
    const s = node.findDirectExpression(Expressions.Source);
    if (s === undefined) {
      return undefined;
    }

    const uniqueName = this.uniqueName(node.getFirstToken().getStart(), lowFile.getFilename(), highSyntax);

    const code = `DATA(${uniqueName}) = ${s.concatTokens()}.\n` +
      " ".repeat(node.getFirstToken().getStart().getCol() - 1);
    const fix1 = EditHelper.insertAt(lowFile, node.getFirstToken().getStart(), code);
    const fix2 = EditHelper.replaceRange(lowFile, s.getFirstToken().getStart(), s.getLastToken().getEnd(), uniqueName);
    const fix = EditHelper.merge(fix2, fix1);

    return Issue.atToken(lowFile, node.getFirstToken(), "Outline LOOP input", this.getMetadata().key, this.conf.severity, fix);
  }

  private outlineLoopTarget(node: StatementNode, lowFile: ABAPFile, _highSyntax: ISyntaxResult): Issue | undefined {
// also allows outlining of voided types
    if (!(node.get() instanceof Statements.Loop)) {
      return undefined;
    }

    const sourceName = node.findDirectExpression(Expressions.SimpleSource2)?.concatTokens();
    if (sourceName === undefined) {
      return undefined;
    }

    const concat = node.concatTokens();
    if (concat.includes(" REFERENCE INTO ")) {
      return undefined;
    }
    const indentation = " ".repeat(node.getFirstToken().getStart().getCol() - 1);

    const dataTarget = node.findDirectExpression(Expressions.Target)?.findDirectExpression(Expressions.InlineData);
    if (dataTarget) {
      const targetName = dataTarget.findDirectExpression(Expressions.TargetField)?.concatTokens() || "DOWNPORT_ERROR";
      const code = `DATA ${targetName} LIKE LINE OF ${sourceName}.\n${indentation}`;
      const fix1 = EditHelper.insertAt(lowFile, node.getFirstToken().getStart(), code);
      const fix2 = EditHelper.replaceRange(lowFile, dataTarget.getFirstToken().getStart(), dataTarget.getLastToken().getEnd(), targetName);
      const fix = EditHelper.merge(fix2, fix1);
      return Issue.atToken(lowFile, node.getFirstToken(), "Outline LOOP data target", this.getMetadata().key, this.conf.severity, fix);
    }

    const fsTarget = node.findDirectExpression(Expressions.FSTarget)?.findDirectExpression(Expressions.InlineFS);
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

  private outlineValue(node: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {

    for (const i of node.findAllExpressionsRecursive(Expressions.Source)) {
      const firstToken = i.getFirstToken();
      if (firstToken.getStr().toUpperCase() !== "VALUE") {
        continue;
      }

      const type = this.findType(i, lowFile, highSyntax);
      if (type === undefined) {
        continue;
      }

      const uniqueName = this.uniqueName(firstToken.getStart(), lowFile.getFilename(), highSyntax);

      const indentation = " ".repeat(node.getFirstToken().getStart().getCol() - 1);
      let body = "";

      let structureName = uniqueName;
      let added = false;
      let data = "";
      for (const b of i.findDirectExpression(Expressions.ValueBody)?.getChildren() || []) {
        if (b.concatTokens() === "(" && added === false) {
          structureName = this.uniqueName(firstToken.getStart(), lowFile.getFilename(), highSyntax);
          data = indentation + `DATA ${structureName} LIKE LINE OF ${uniqueName}.\n`;
        }
        if (b.get() instanceof Expressions.FieldAssignment) {
          if (added === false) {
            body += data;
            added = true;
          }
          body += indentation + structureName + "-" + b.concatTokens() + ".\n";
        }
        if (b.get() instanceof Expressions.Source) {
          structureName = b.concatTokens();
        }
        if (b.concatTokens() === ")") {
          body += indentation + `APPEND ${structureName} TO ${uniqueName}.\n`;
        }
      }

      const abap = `DATA ${uniqueName} TYPE ${type}.\n` +
        body +
        indentation;
      const fix1 = EditHelper.insertAt(lowFile, node.getFirstToken().getStart(), abap);
      const fix2 = EditHelper.replaceRange(lowFile, firstToken.getStart(), i.getLastToken().getEnd(), uniqueName);
      const fix = EditHelper.merge(fix2, fix1);

      return Issue.atToken(lowFile, firstToken, "Downport VALUE", this.getMetadata().key, this.conf.severity, fix);

    }

    return undefined;
  }

  private findType(i: ExpressionNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): string | undefined {

    const expr = i.findDirectExpression(Expressions.TypeNameOrInfer);
    if (expr === undefined) {
      return undefined;
    }
    const firstToken = expr.getFirstToken();

    const concat = expr.concatTokens();
    if (concat !== "#") {
      return concat;
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

    return inferred.getType().getQualifiedName();
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
      } else if (found.getType() instanceof VoidType) {
        return Issue.atToken(lowFile, i.getFirstToken(), "Error outlining voided type", this.getMetadata().key, this.conf.severity);
      }
      const type = found.getType().getQualifiedName() ? found.getType().getQualifiedName() : found.getType().toABAP();

      const code = `FIELD-SYMBOLS ${name} TYPE ${type}.\n` +
        " ".repeat(node.getFirstToken().getStart().getCol() - 1);
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
      } else if (found.getType() instanceof VoidType) {
        return Issue.atToken(lowFile, i.getFirstToken(), "Error outlining voided type", this.getMetadata().key, this.conf.severity);
      }
      const type = found.getType().getQualifiedName() ? found.getType().getQualifiedName() : found.getType().toABAP();

      const code = `DATA ${name} TYPE ${type}.\n` +
        " ".repeat(node.getFirstToken().getStart().getCol() - 1);
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
      const type = this.findType(i, lowFile, highSyntax);

      const abap = `DATA ${uniqueName} TYPE ${type}.\n` +
        " ".repeat(node.getFirstToken().getStart().getCol() - 1) +
        `${uniqueName} = ${body}.\n` +
        " ".repeat(node.getFirstToken().getStart().getCol() - 1);
      const fix1 = EditHelper.insertAt(lowFile, node.getFirstToken().getStart(), abap);
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
      const type = this.findType(i, lowFile, highSyntax);
      const body = i.findDirectExpression(Expressions.Source)?.concatTokens();

      const abap = `DATA ${uniqueName} TYPE REF TO ${type}.\n` +
        " ".repeat(node.getFirstToken().getStart().getCol() - 1) +
        `${uniqueName} ?= ${body}.\n` +
        " ".repeat(node.getFirstToken().getStart().getCol() - 1);
      const fix1 = EditHelper.insertAt(lowFile, node.getFirstToken().getStart(), abap);
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


  private replaceXsdBool(node: StatementNode, lowFile: ABAPFile, highSyntax: ISyntaxResult): Issue | undefined {
    const spag = highSyntax.spaghetti.lookupPosition(node.getFirstToken().getStart(), lowFile.getFilename());

    for (const r of spag?.getData().references || []) {
      if (r.referenceType === ReferenceType.BuiltinMethodReference
          && r.position.getName().toUpperCase() === "XSDBOOL") {
        const token = r.position.getToken();
        const fix = EditHelper.replaceRange(lowFile, token.getStart(), token.getEnd(), "boolc");
        return Issue.atToken(lowFile, token, "Use BOOLC", this.getMetadata().key, this.conf.severity, fix);
      }
    }

    return undefined;
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

      const type = this.findType(found, lowFile, highSyntax);

      const data = `DATA ${name} TYPE REF TO ${type}.\n` +
        " ".repeat(node.getFirstToken().getStart().getCol() - 1) +
        abap + "\n" +
        " ".repeat(node.getFirstToken().getStart().getCol() - 1);
      const fix1 = EditHelper.insertAt(lowFile, node.getFirstToken().getStart(), data);
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
