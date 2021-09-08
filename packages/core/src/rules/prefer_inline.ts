import * as Statements from "../abap/2_statements/statements";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {IRegistry} from "../_iregistry";
import {IRuleMetadata, RuleTag, IRule} from "./_irule";
import {Version} from "../version";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {IdentifierMeta, TypedIdentifier} from "../abap/types/_typed_identifier";
import {ScopeType} from "../abap/5_syntax/_scope_type";
import {Token} from "../abap/1_lexer/tokens/_token";
import {ReferenceType} from "../abap/5_syntax/_reference";
import {Identifier} from "../abap/4_file_information/_identifier";
import {EditHelper, IEdit} from "../edit_helper";

interface IVariableReference {
  position: Identifier,
  resolved: Identifier
}

export class PreferInlineConf extends BasicRuleConfig {

}

export class PreferInline implements IRule {
  private reg: IRegistry;
  private conf = new PreferInlineConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "prefer_inline",
      title: "Prefer Inline Declarations",
      shortDescription: `Prefer inline to up-front declarations.`,
      extendedInformation: `EXPERIMENTAL

Activates if language version is v740sp02 or above.

Variables must be local(METHOD or FORM).

No generic or void typed variables.

First position used must be a full/pure write.

Move statment is not a cast(?=)

https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#prefer-inline-to-up-front-declarations`,
      tags: [RuleTag.Styleguide, RuleTag.Upport, RuleTag.Experimental, RuleTag.Quickfix],
      badExample: `DATA foo TYPE i.
foo = 2.
DATA percentage TYPE decfloat34.
percentage = ( comment_number / abs_statement_number ) * 100.`,
      goodExample: `DATA(foo) = 2.
DATA(percentage) = CONV decfloat34( comment_number / abs_statement_number ) * 100.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public setConfig(conf: PreferInlineConf): void {
    this.conf = conf;
  }

  public run(obj: IObject): readonly Issue[] {

    if (obj.getType() === "INTF") {
      return [];
    }

    if (this.reg.getConfig().getVersion() < Version.v740sp02 && this.reg.getConfig().getVersion() !== Version.Cloud) {
      return [];
    } else if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const scopes = this.findScopeCandidates(new SyntaxLogic(this.reg, obj).run().spaghetti.getTop());

    const ret: Issue[] = [];
    for (const s of scopes) {
      ret.push(...this.analyzeScope(s, obj));
    }

    return ret;
  }

///////////////////////////

  private analyzeScope(node: ISpaghettiScopeNode, obj: ABAPObject): Issue[] {
    const ret: Issue[] = [];

    const vars = node.getData().vars;
    for (const name in vars) {
      const identifier = vars[name];
      if (this.isLocalDefinition(node, identifier) === false
          || identifier.getMeta().includes(IdentifierMeta.InlineDefinition)
          || identifier.getMeta().includes(IdentifierMeta.FormParameter)) {
        continue;
      } else if (identifier.getType().isGeneric() === true) {
        continue;
      } else if (identifier.getType().containsVoid() === true) {
        continue;
      }

      const write = this.firstUseIsWrite(node, identifier);
      if (write === undefined) {
        continue;
      }

      // check that it is a pure write, eg not sub component assignment
      const next = this.findNextToken(write, obj);
      if (next === undefined) {
        continue;
      } else if (next?.getStart().equals(write.position.getEnd()) && next.getStr() !== "." && next.getStr() !== ",") {
        continue;
      }
      const file = obj.getABAPFileByName(identifier.getFilename());
      const writeStatement = EditHelper.findStatement(next, file);
      const statementType = writeStatement?.get();
      if (statementType === undefined) {
        continue;
      }

      // for now only allow some specific target statements, todo refactor
      if (!(statementType instanceof Statements.Move
          || statementType instanceof Statements.Catch
          || statementType instanceof Statements.ReadTable
          || statementType instanceof Statements.Loop)
          || writeStatement?.concatTokens()?.includes("?=")) {
        continue;
      }

      const statement = EditHelper.findStatement(identifier.getToken(), file);
      const concat = statement?.concatTokens().toUpperCase();
      if (concat?.includes("BEGIN OF")) {
        continue;
      }
      let fix: IEdit | undefined = undefined;
      if (file && statement) {
        const fix1 = EditHelper.deleteStatement(file, statement);
        const name = identifier.getName();
        const replace = name.startsWith("<") ? "FIELD-SYMBOL(" + name + ")" : "DATA(" + name + ")";
        const fix2 = EditHelper.replaceRange(file, write.position.getStart(), write.position.getEnd(), replace);
        fix = EditHelper.merge(fix1, fix2);
      }
      const message = this.getMetadata().title + ", " + name;
      ret.push(Issue.atIdentifier(identifier, message, this.getMetadata().key, this.conf.severity, fix));
    }

    return ret;
  }

////////////////////////

  private findNextToken(ref: IVariableReference, obj: ABAPObject): Token | undefined {

    const file = obj.getABAPFileByName(ref.resolved.getFilename());
    if (file === undefined) {
      return undefined;
    }

    for (const t of file.getTokens()) {
      if (t.getStart().isAfter(ref.position.getEnd())) {
        return t;
      }
    }

    return undefined;
  }

  private firstUseIsWrite(node: ISpaghettiScopeNode, identifier: TypedIdentifier): IVariableReference | undefined {
// assumption: variables are local, so only the current scope must be searched

    for (const r of node.getData().references) {
      if (r.referenceType === ReferenceType.TypeReference
          && r.resolved?.getStart().equals(identifier.getStart()) === true) {
        return undefined;
      }
    }

    let firstRead: IVariableReference | undefined = undefined;
    for (const r of node.getData().references) {
      if (r.referenceType !== ReferenceType.DataReadReference
          || r.resolved?.getStart().equals(identifier.getStart()) === false) {
        continue;
      }
      if (r.resolved) {
        firstRead = {position: r.position, resolved: r.resolved};
        break;
      }
    }

    let firstWrite: IVariableReference | undefined = undefined;
    for (const w of node.getData().references) {
      if (w.referenceType !== ReferenceType.DataWriteReference
          || w.resolved?.getStart().equals(identifier.getStart()) === false) {
        continue;
      }
      if (w.resolved) {
        firstWrite = {position: w.position, resolved: w.resolved};
        break;
      }
    }

    if (firstRead === undefined) {
      return firstWrite;
    } else if (firstWrite === undefined) {
      return undefined;
    } else if (firstWrite.position.getStart().getRow() === firstRead.position.getStart().getRow()) {
// if the same statement both reads and write the same variable
// note that currently just the line number is compared, this is not correct, it should check if its the same statement
      return undefined;
    } else if (firstWrite.position.getStart().isBefore(firstRead.position.getStart())) {
      return firstWrite;
    }
    return undefined;
  }

  private isLocalDefinition(node: ISpaghettiScopeNode, identifier: TypedIdentifier): boolean {
    const {start, end} = node.calcCoverage();

    if (identifier.getStart().isAfter(start) && identifier.getStart().isBefore(end)) {
      return true;
    } else {
      return false;
    }
  }

  private findScopeCandidates(node: ISpaghettiScopeNode): ISpaghettiScopeNode[] {

    if (node.getIdentifier().stype === ScopeType.Form
        || node.getIdentifier().stype === ScopeType.Method) {
      return [node];
    }

    let ret: ISpaghettiScopeNode[] = [];
    for (const c of node.getChildren()) {
      ret = ret.concat(this.findScopeCandidates(c));
    }
    return ret;
  }

}