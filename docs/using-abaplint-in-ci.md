# Using abaplint in CI

There are several ways to enable automated linting of your code in popular cloud git repositories. This will allow auto-linting of commits to master branch and auto checks for upcoming pull requests from colleagues or contributors.

- Gitlab: example can be found in [examples/.gitlab-ci.yml](examples/.gitlab-ci.yml). Working repo for this configuration can be found at [abaplinted_sample gitLAB](https://gitlab.com/atsybulsky/abaplinted_sample)
- Travis: example configuration is in [examples/.travis.yml](examples/.travis.yml). Repository example is at [abaplinted_sample gitHUB](https://github.com/sbcgua/abaplinted_sample) (also check pull requests)
- Github actions: example workflow can be seen in [github-actions-workflow.yml](github-actions-workflow.yml). See working repo example at [abaplinted_sample gitHUB](https://github.com/sbcgua/abaplinted_sample)

![workflow example](workflow-example.png)

## Additional links

* [GitHub App](https://github.com/apps/abaplint)
* [GitHub Actions](https://github.com/abaplint/actions-abaplint)
* [GitLab Pipelines](https://gitlab.com/sbu-absw/abaplint-example)
* [Bitbucket Pipelines](https://bitbucket.org/larshp/abaplint_pipeline)
* [Azure Pipelines](https://github.com/abaplint/azure-devops-example)
* [Travis CI](https://blogs.sap.com/2018/12/25/automatic-checking-of-your-abap-code-in-githubgitlab-with-ci-and-abaplint/)