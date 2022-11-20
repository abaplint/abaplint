import {AbstractObject} from "./_abstract_object";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import * as Types from "../abap/types/basic";
import {IRegistry} from "../_iregistry";
import {DDIC} from "../ddic";
import {IObjectAndToken} from "../_iddic_references";
import {AnyType, DataReference, GenericObjectReferenceType} from "../abap/types/basic";

export class TableType extends AbstractObject {
  private parsedXML: {
    rowtype?: string,
    rowkind?: string
    datatype?: string
    leng?: string
    decimals?: string} | undefined = undefined;

  public getType(): string {
    return "TTYP";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }

  public setDirty(): void {
    this.parsedXML = undefined;
    super.setDirty();
  }

  public parseType(reg: IRegistry): AbstractType {
    this.parseXML();

    const ddic = new DDIC(reg);

    const references: IObjectAndToken[] = [];
    let type: AbstractType;
    if (this.parsedXML === undefined) {
      type = new Types.UnknownType("Table Type, parser error", this.getName());
    } else if (this.parsedXML.rowkind === "S") {
      const lookup = ddic.lookupTableOrView(this.parsedXML.rowtype);
      type = new Types.TableType(lookup.type, {withHeader: false}, this.getName());
      if (lookup.object) {
        references.push({object: lookup.object});
      }
    } else if (this.parsedXML.rowkind === "E") {
      const lookup = ddic.lookupDataElement(this.parsedXML.rowtype);
      type = new Types.TableType(lookup.type, {withHeader: false}, this.getName());
      if (lookup.object) {
        references.push({object: lookup.object});
      }
    } else if (this.parsedXML.rowkind === "L") {
      const lookup = ddic.lookupTableType(this.parsedXML.rowtype);
      type = new Types.TableType(lookup.type, {withHeader: false}, this.getName());
      if (lookup.object) {
        references.push({object: lookup.object});
      }
    } else if (this.parsedXML.rowkind === "R" && this.parsedXML.rowtype === "OBJECT") {
      type = new Types.TableType(new GenericObjectReferenceType(), {withHeader: false}, this.getName());
    } else if (this.parsedXML.rowkind === "R" && this.parsedXML.rowtype === "DATA") {
      type = new Types.TableType(new DataReference(new AnyType()), {withHeader: false}, this.getName());
    } else if (this.parsedXML.rowkind === "R" && this.parsedXML.rowtype !== undefined) {
      const lookup = ddic.lookupObject(this.parsedXML.rowtype);
      type = new Types.TableType(lookup.type, {withHeader: false}, this.getName());
      if (lookup.object) {
        references.push({object: lookup.object});
      }
    } else if (this.parsedXML.rowkind === "") {
      if (this.parsedXML.datatype === undefined) {
        type = new Types.UnknownType("Table Type, empty DATATYPE" + this.getName(), this.getName());
      } else {
        const row = ddic.textToType(this.parsedXML.datatype, this.parsedXML.leng, this.parsedXML.decimals, this.getName());
        type = new Types.TableType(row, {withHeader: false}, this.getName());
      }
    } else {
      type = new Types.UnknownType("Table Type, unknown kind \"" + this.parsedXML.rowkind + "\"" + this.getName(), this.getName());
    }

    reg.getDDICReferences().setUsing(this, references);
    return type;
  }

////////////////////

  private parseXML() {
    if (this.parsedXML !== undefined) {
      return;
    }

    this.parsedXML = {};

    const parsed = super.parseRaw2();
    if (parsed === undefined || parsed.abapGit === undefined) {
      return;
    }

    const dd40v = parsed.abapGit["asx:abap"]["asx:values"].DD40V;
    this.parsedXML.rowtype = dd40v.ROWTYPE ? dd40v.ROWTYPE : "";
    this.parsedXML.rowkind = dd40v.ROWKIND ? dd40v.ROWKIND : "";
    this.parsedXML.datatype = dd40v.DATATYPE;
    this.parsedXML.leng = dd40v.LENG;
    this.parsedXML.decimals = dd40v.DECIMALS;
  }

}
