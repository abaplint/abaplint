import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {IRegistry} from "../_iregistry";
import {IRuleMetadata, RuleTag, IRule} from "./_irule";
import {Version} from "../version";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {IScopeVariable, IVariableReference, ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {IdentifierMeta} from "../abap/types/_typed_identifier";
import {ScopeType} from "../abap/5_syntax/_scope_type";
import {Token} from "../abap/1_lexer/tokens/_token";

export class PreferInlineConf extends BasicRuleConfig {

}

export class PreferInline implements IRule {

  private conf = new PreferInlineConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "prefer_inline",
      title: "Prefer Inline Declarations",
      shortDescription: `Prefer inline to up-front declarations.
Activates if language version is v740sp02 or above.
Variables must be local(METHOD or FORM).
No generic or void typed variables.
First position used must be a full/pure write.`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#prefer-inline-to-up-front-declarations`,
      tags: [RuleTag.Styleguide, RuleTag.Upport, RuleTag.Experimental],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: PreferInlineConf): void {
    this.conf = conf;
  }

  public run(obj: IObject, reg: IRegistry): readonly Issue[] {

    if (reg.getConfig().getVersion() < Version.v740sp02) {
      return [];
    } else if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const scopes = this.findScopeCandidates(new SyntaxLogic(reg, obj).run().spaghetti.getTop());

    let ret: Issue[] = [];
    for (const s of scopes) {
      ret = ret.concat(this.analyzeScope(s, obj));
    }

    return ret;
  }

///////////////////////////

  private analyzeScope(node: ISpaghettiScopeNode, obj: ABAPObject): Issue[] {
    const ret: Issue[] = [];

    for (const d of node.getData().vars) {
      if (this.isLocalDefinition(node, d) === false
          || d.identifier.getMeta().includes(IdentifierMeta.InlineDefinition)) {
        continue;
      } else if (d.identifier.getType().isGeneric() === true) {
        continue;
      } else if (d.identifier.getType().containsVoid() === true) {
        continue;
      }

      const write = this.firstUseIsWrite(node, d);
      if (write === undefined) {
        continue;
      }

      const next = this.findNextToken(write, obj);
      if (next?.getStart().equals(write.position.getEnd())) {
        continue;
      }

      const message = this.getMetadata().title + ", " + d.name;
      ret.push(Issue.atIdentifier(d.identifier, message, this.getMetadata().key));
    }

    return ret;
  }

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

  private firstUseIsWrite(node: ISpaghettiScopeNode, v: IScopeVariable): IVariableReference | undefined {
// assumption: variables are local, so only the current scope must be searched

    let firstRead: IVariableReference | undefined = undefined;
    for (const r of node.getData().reads) {
      if (r.resolved.getStart().equals(v.identifier.getStart()) === false) {
        continue;
      }
      if (firstRead === undefined
          || firstRead.position.getStart().isAfter(v.identifier.getStart())) {
        firstRead = r;
      }
    }

    let firstWrite: IVariableReference | undefined = undefined;
    for (const w of node.getData().writes) {
      if (w.resolved.getStart().equals(v.identifier.getStart()) === false) {
        continue;
      }
      if (firstWrite === undefined
          || firstWrite.position.getStart().isAfter(v.identifier.getStart())) {
        firstWrite = w;
      }
    }

    if (firstRead === undefined) {
      return firstWrite;
    } else if (firstWrite === undefined) {
      return undefined;
    } else if (firstWrite.position.getStart().isBefore(firstRead.position.getStart())) {
      return firstWrite;
    }
    return undefined;
  }

  private isLocalDefinition(node: ISpaghettiScopeNode, v: IScopeVariable): boolean {
    const {start, end} = node.calcCoverage();

    if (v.identifier.getStart().isAfter(start) && v.identifier.getStart().isBefore(end)) {
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