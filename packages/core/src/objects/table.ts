import * as Types from "../abap/types/basic";
import {AbstractObject} from "./_abstract_object";
import {xmlToArray} from "../xml_utils";
import {IRegistry} from "../_iregistry";
import {DDIC} from "../ddic";

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
      DECIMALS?: string}[]} | undefined;

  public getType(): string {
    return "TABL";
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

  public parseType(reg: IRegistry): Types.StructureType | Types.UnknownType | Types.VoidType {
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
      } else if (comptype === "S"
          && ( field.FIELDNAME === ".INCLUDE" || field.FIELDNAME === ".INCLU--AP")) { // incude or append structure
        const found = ddic.lookupTableOrView(field.PRECFIELD);
        if (found instanceof Types.StructureType) {
          for (const c of found.getComponents()) {
            components.push({
              name: c.name,
              type: c.type});
          }
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
        components.push({
          name: field.FIELDNAME,
          type: new Types.ObjectReferenceType(field.ROLLNAME)});
      } else if (comptype === "L") {
        components.push({
          name: field.FIELDNAME,
          type: ddic.lookupTableType(field.ROLLNAME)});
      } else if (comptype === "") { // built in
        const datatype = field.DATATYPE;
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

    return new Types.StructureType(components);
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
    const parsed = super.parseRaw();
    if (parsed === undefined) {
      return;
    }

    this.parsedData = {fields: []};

// enhancement category
    if (parsed.abapGit["asx:abap"]["asx:values"]?.DD02V?.EXCLASS === undefined) {
      this.parsedData.enhancementCategory = EnhancementCategory.NotClassified;
    } else {
      this.parsedData.enhancementCategory = parsed.abapGit["asx:abap"]["asx:values"]?.DD02V?.EXCLASS?._text;
    }

// table category
    this.parsedData.tableCategory = parsed.abapGit["asx:abap"]["asx:values"]?.DD02V?.TABCLASS?._text;

// fields
    const fields = parsed.abapGit["asx:abap"]["asx:values"].DD03P_TABLE;
    for (const field of xmlToArray(fields?.DD03P)) {
      this.parsedData.fields.push({
        FIELDNAME: field.FIELDNAME._text,
        ROLLNAME: field.ROLLNAME?._text,
        COMPTYPE: field.COMPTYPE?._text,
        PRECFIELD: field.PRECFIELD?._text,
        LENG: field.LENG?._text,
        INTLEN: field.INTLEN?._text,
        DATATYPE: field.DATATYPE?._text,
        DECIMALS: field.DECIMALS?._text,
      });
    }
  }

}
