import * as Types from "../abap/types/basic";
import {AbstractObject} from "./_abstract_object";
import {xmlToArray} from "../xml_utils";
import {IRegistry} from "../_iregistry";
import {DDIC} from "../ddic";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {AnyType, DataReference} from "../abap/types/basic";

export enum EnhancementCategory {
  NotClassified = "0",
  CannotBeEhanced = "1",
  Character = "2",
  CharacterOrNumeric = "3",
  Deep = "4",
}

export enum TableCategory {
  Transparent = "TRANSP",
  Structure = "INTTAB",
  Cluster = "CLUSTER",
  Pooled = "POOL",
  View = "VIEW",
  Append = "APPEND",
}

export class Table extends AbstractObject {
  private parsedData: {
    tableCategory?: TableCategory | undefined,
    enhancementCategory?: EnhancementCategory,
    fields: {
      FIELDNAME: string,
      ROLLNAME?: string,
      COMPTYPE?: string,
      PRECFIELD?: string,
      LENG?: string,
      INTLEN?: string,
      DATATYPE?: string,
      DECIMALS?: string,
      KEYFLAG?: string
    }[]} | undefined;

  public getType(): string {
    return "TABL";
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public setDirty(): void {
    this.parsedData = undefined;
    super.setDirty();
  }

  public listKeys(): string[] {
    if (this.parsedData === undefined) {
      this.parseXML();
    }
    if (this.parsedData === undefined) {
      return [];
    }

    const ret: string[] = [];
    for (const p of this.parsedData.fields) {
      if (p.KEYFLAG === "X") {
        ret.push(p.FIELDNAME);
      }
    }
    return ret;
  }

  public parseType(reg: IRegistry): AbstractType {
    if (this.parsedData === undefined) {
      this.parseXML();
    }
    if (this.parsedData === undefined) {
      return new Types.UnknownType("Table, parser error");
    }

    const components: Types.IStructureComponent[] = [];
    const ddic = new DDIC(reg);
    for (const field of this.parsedData.fields) {
      const comptype = field.COMPTYPE ? field.COMPTYPE : "";
      if (comptype === "E") { // data element
        components.push({
          name: field.FIELDNAME,
          type: ddic.lookupDataElement(field.ROLLNAME)});
      } else if (field.FIELDNAME === ".INCLUDE" || field.FIELDNAME === ".INCLU--AP") { // incude or append structure
        if (field.PRECFIELD === undefined) {
          return new Types.UnknownType("Table, parser error, PRECFIELD undefined");
        }
        let found = ddic.lookupTableOrView(field.PRECFIELD);
        if (found instanceof TypedIdentifier) {
          found = found.getType();
        }
        if (found instanceof Types.StructureType) {
          for (const c of found.getComponents()) {
            components.push({
              name: c.name,
              type: c.type});
          }
        } else if ((field.PRECFIELD?.startsWith("CI_") || field.PRECFIELD?.startsWith("SI_"))
            && found instanceof Types.UnknownType) {
          continue;
        } else if (found instanceof Types.UnknownType) {
          return found;
        } else if (found instanceof Types.VoidType) {
          // set the full structure to void
          return found;
        } else {
          components.push({
            name: field.FIELDNAME,
            type: found});
        }
      } else if (comptype === "S" && field.FIELDNAME.startsWith(".INCLU-")) {
        components.push({
          name: field.FIELDNAME,
          type: new Types.UnknownType("Table " + this.getName() + ", todo, group named INCLUDE")});
      } else if (comptype === "S") {
        components.push({
          name: field.FIELDNAME,
          type: ddic.lookupTableOrView(field.ROLLNAME)});
      } else if (comptype === "R") {
        if (field.ROLLNAME === undefined) {
          throw new Error("Expected ROLLNAME");
        }
        if (field.ROLLNAME === "DATA") {
          components.push({
            name: field.FIELDNAME,
            type: new DataReference(new AnyType())});
        } else {
          components.push({
            name: field.FIELDNAME,
            type: ddic.lookupObject(field.ROLLNAME)});
        }
      } else if (comptype === "L") {
        components.push({
          name: field.FIELDNAME,
          type: ddic.lookupTableType(field.ROLLNAME)});
      } else if (comptype === "") { // built in
        const datatype = field.DATATYPE;
        if (datatype === undefined) {
          throw new Error("Expected DATATYPE");
        }
        const length = field.LENG ? field.LENG : field.INTLEN;
        const decimals = field.DECIMALS ? field.DECIMALS : undefined;
        components.push({
          name: field.FIELDNAME,
          type: ddic.textToType(datatype, length, decimals, this.getName())});
      } else {
        components.push({
          name: field.FIELDNAME,
          type: new Types.UnknownType("Table " + this.getName() + ", unknown component type " + comptype)});
      }
    }

    if (components.length === 0) {
      throw new Error("Table/Structure " + this.getName() + " does not contain any components");
    }

    return new Types.StructureType(components, this.getName());
  }

  public getTableCategory(): TableCategory | undefined {
    if (this.parsedData === undefined) {
      this.parseXML();
    }

    return this.parsedData?.tableCategory;
  }

  public getEnhancementCategory(): EnhancementCategory {
    if (this.parsedData === undefined) {
      this.parseXML();
    }
    if (this.parsedData?.enhancementCategory === undefined) {
      return EnhancementCategory.NotClassified;
    }
    return this.parsedData.enhancementCategory;
  }

///////////////

  private parseXML() {
    const parsed = super.parseRaw2();
    if (parsed === undefined) {
      return;
    }

    this.parsedData = {fields: []};

// enhancement category
    if (parsed.abapGit["asx:abap"]["asx:values"]?.DD02V?.EXCLASS === undefined) {
      this.parsedData.enhancementCategory = EnhancementCategory.NotClassified;
    } else {
      this.parsedData.enhancementCategory = parsed.abapGit["asx:abap"]["asx:values"]?.DD02V?.EXCLASS;
    }

// table category
    this.parsedData.tableCategory = parsed.abapGit["asx:abap"]["asx:values"]?.DD02V?.TABCLASS;

// fields
    const fields = parsed.abapGit["asx:abap"]["asx:values"]?.DD03P_TABLE;
    for (const field of xmlToArray(fields?.DD03P)) {
      this.parsedData.fields.push({
        FIELDNAME: field.FIELDNAME,
        ROLLNAME: field.ROLLNAME,
        COMPTYPE: field.COMPTYPE,
        PRECFIELD: field.PRECFIELD,
        LENG: field.LENG,
        INTLEN: field.INTLEN,
        DATATYPE: field.DATATYPE,
        DECIMALS: field.DECIMALS,
        KEYFLAG: field.KEYFLAG,
      });
    }
  }

}
