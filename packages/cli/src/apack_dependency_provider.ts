import {IDependency} from "abaplint";
import {xml2js} from "xml-js";

export class ApackDependencyProvider {

  public static fromManifest(manifestContents: string): IDependency[] {
    if (!manifestContents || !manifestContents.length) {
      return [];
    }

    const result: IDependency[] = [];
    const manifest = xml2js(manifestContents, {compact: true}) as any;
    let apackDependencies = manifest["asx:abap"]["asx:values"]["DATA"]?.["DEPENDENCIES"]?.item;
    if (!apackDependencies) {
      return [];
    } else if (!apackDependencies.length) {
      apackDependencies = [apackDependencies];
    }

    for (const dependency of apackDependencies) {
      result.push({
        files: "/src/**/*.*",
        url: dependency["GIT_URL"]["_text"],
      });
    }

    return result;
  }
}