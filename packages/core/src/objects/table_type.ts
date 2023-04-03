import {AbstractObject} from "./_abstract_object";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import * as Types from "../abap/types/basic";
import {IRegistry} from "../_iregistry";
import {DDIC} from "../ddic";
import {IObjectAndToken} from "../_iddic_references";
import {AnyType, DataReference, GenericObjectReferenceType, ITableOptions, TableAccessType} from "../abap/types/basic";
import {xmlToArray} from "../xml_utils";

export class TableType extends AbstractObject {
  private parsedXML: {
    rowtype?: string,
    rowkind?: string,
    datatype?: string,
    leng?: string,
    decimals?: string,
    dd42v: {keyname: string, keyfield: string}[];
    dd43v: {keyname: string, accessmode: string, kind: string, unique: boolean}[];
  } | undefined = undefined;

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

  private buildTableOptions(): ITableOptions {
    const tableOptions: ITableOptions = {
      withHeader: false,
      keyType: Types.TableKeyType.user,
      secondary: [],
    };

    for (const k of this.parsedXML?.dd43v || []) {
      const fields: string[] = [];
      for (const f of this.parsedXML?.dd42v || []) {
        if (f.keyname === k.keyname) {
          fields.push(f.keyfield);
        }
      }
      let accessType: TableAccessType = TableAccessType.standard;
      switch (k.accessmode) {
        case "S":
          accessType = TableAccessType.sorted;
          break;
        case "H":
          accessType = TableAccessType.hashed;
          break;
        default:
          break;
      }
      tableOptions.secondary?.push({
        name: k.keyname,
        type: accessType,
        keyFields: fields,
        isUnique: k.unique,
      });
    }

    return tableOptions;
  }

  public parseType(reg: IRegistry): AbstractType {
    this.parseXML();

    const ddic = new DDIC(reg);

    const references: IObjectAndToken[] = [];
    let type: AbstractType;
    const tableOptions = this.buildTableOptions();

    if (this.parsedXML === undefined) {
      type = new Types.UnknownType("Table Type, parser error", this.getName());
    } else if (this.parsedXML.rowkind === "S") {
      const lookup = ddic.lookupTableOrView(this.parsedXML.rowtype);
      type = new Types.TableType(lookup.type, tableOptions, this.getName());
      if (lookup.object) {
        references.push({object: lookup.object});
      }
    } else if (this.parsedXML.rowkind === "E") {
      const lookup = ddic.lookupDataElement(this.parsedXML.rowtype);
      type = new Types.TableType(lookup.type, tableOptions, this.getName());
      if (lookup.object) {
        references.push({object: lookup.object});
      }
    } else if (this.parsedXML.rowkind === "L") {
      const lookup = ddic.lookupTableType(this.parsedXML.rowtype);
      type = new Types.TableType(lookup.type, tableOptions, this.getName());
      if (lookup.object) {
        references.push({object: lookup.object});
      }
    } else if (this.parsedXML.rowkind === "R" && this.parsedXML.rowtype === "OBJECT") {
      type = new Types.TableType(new GenericObjectReferenceType(), tableOptions, this.getName());
    } else if (this.parsedXML.rowkind === "R" && this.parsedXML.rowtype === "DATA") {
      type = new Types.TableType(new DataReference(new AnyType()), tableOptions, this.getName());
    } else if (this.parsedXML.rowkind === "R" && this.parsedXML.rowtype !== undefined) {
      const lookup = ddic.lookupObject(this.parsedXML.rowtype);
      type = new Types.TableType(lookup.type, tableOptions, this.getName());
      if (lookup.object) {
        references.push({object: lookup.object});
      }
    } else if (this.parsedXML.rowkind === "") {
      if (this.parsedXML.datatype === undefined) {
        type = new Types.UnknownType("Table Type, empty DATATYPE" + this.getName(), this.getName());
      } else {
        const row = ddic.textToType(this.parsedXML.datatype, this.parsedXML.leng, this.parsedXML.decimals, this.getName());
        type = new Types.TableType(row, tableOptions, this.getName());
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

    this.parsedXML = {
      dd42v: [],
      dd43v: [],
    };

    const parsed = super.parseRaw2();
    if (parsed === undefined || parsed.abapGit === undefined) {
      return;
    }

    const values = parsed.abapGit["asx:abap"]["asx:values"];

    const dd40v = values.DD40V;
    this.parsedXML.rowtype = dd40v.ROWTYPE ? dd40v.ROWTYPE : "";
    this.parsedXML.rowkind = dd40v.ROWKIND ? dd40v.ROWKIND : "";
    this.parsedXML.datatype = dd40v.DATATYPE;
    this.parsedXML.leng = dd40v.LENG;
    this.parsedXML.decimals = dd40v.DECIMALS;

    for (const x of xmlToArray(values.DD42V?.DD42V)) {
      this.parsedXML.dd42v.push({
        keyname: x.SECKEYNAME || "",
        keyfield: x.KEYFIELD || "",
      });
    }
    for (const x of xmlToArray(values.DD43V?.DD43V)) {
      this.parsedXML.dd43v.push({
        keyname: x.SECKEYNAME || "",
        accessmode: x.ACCESSMODE || "",
        kind: x.KIND || "",
        unique: x.SECKEYUNIQUE === "X",
      });
    }
  }

}
