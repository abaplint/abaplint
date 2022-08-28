import {AbstractObject} from "./_abstract_object";

export class CDSMetadataExtension extends AbstractObject {

  public getType(): string {
    return "DDLX";
  }

  public getAllowedNaming() {
    return {
      maxLength: 40,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }

  public findSourceFile() {
    return this.getFiles().find(f => f.getFilename().endsWith(".asddlxs") || f.getFilename().endsWith(".acds"));
  }
}
