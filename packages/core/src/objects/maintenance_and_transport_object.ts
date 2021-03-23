import {AbstractObject} from "./_abstract_object";

export class MaintenanceAndTransportObject extends AbstractObject {
  private area: string | undefined = undefined;

  public setDirty() {
    super.setDirty();
    this.area = undefined;
  }

  public getType(): string {
    return "TOBJ";
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }

  public getAllowedNaming() {
    return {
      maxLength: 31,
      allowNamespace: true,
    };
  }

  public getArea(): string | undefined {
    if (this.area === undefined) {
      this.parseXML();
    }
    return this.area;
  }

////////////

  private parseXML() {
    if (this.getFiles().length === 0) {
      return;
    }

    const xml = this.getFiles()[0].getRaw();

    const result = xml.match(/<AREA>([\w/]+)<\/AREA>/);
    if (result) {
      this.area = result[1];
    }
  }

}
