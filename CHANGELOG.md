# Changelog

All notable changes to this project will be documented in this file.

---


# [1.2.0](https://github.com/Nerdware-LLC/lambda-push-notification-service/compare/v1.1.0...v1.2.0) (2022-10-18)


### Features

* **tests:** add Jest globalSetup and test 'pushReceiptsCRUD' ([b7b5a0c](https://github.com/Nerdware-LLC/lambda-push-notification-service/commit/b7b5a0cc02166a95adc1b292e0e091047311d447))

# [1.1.0](https://github.com/Nerdware-LLC/lambda-push-notification-service/compare/v1.0.1...v1.1.0) (2022-10-17)


### Bug Fixes

* **env:** change env var 'AWS_REGION' to 'DYNAMODB_TABLE_REGION' ([263223e](https://github.com/Nerdware-LLC/lambda-push-notification-service/commit/263223e5a68e90af6352e98f769fcaab1f7922bb))


### Features

* **ecr-push:** add 'latest' to docker img tags ([4552fc9](https://github.com/Nerdware-LLC/lambda-push-notification-service/commit/4552fc9f92d49d532c133f09631ab0794391311a))

## [1.0.1](https://github.com/Nerdware-LLC/lambda-push-notification-service/compare/v1.0.0...v1.0.1) (2022-10-15)


### Bug Fixes

* **Dockerfile:** correct path syntax in Dockerfile, use LAMBDA_TASK_ROOT ([2cbfd98](https://github.com/Nerdware-LLC/lambda-push-notification-service/commit/2cbfd9840589b920d1360f2546487bd95a613019))

# 1.0.0 (2022-10-15)


### Bug Fixes

* **gitignore:** correct tsc build output dir to 'function' ([4ec69fb](https://github.com/Nerdware-LLC/lambda-push-notification-service/commit/4ec69fb2acd1aa4ab8bdddb146db21de4d763849))
* **npm-scripts:** correct tsc-build dir name to 'function' ([7b06321](https://github.com/Nerdware-LLC/lambda-push-notification-service/commit/7b06321aec777f73d4fb3f9bc7d644c5f107faaf))
* **tsconfig:** rm 'noEmit' from tsconfig ([09203b7](https://github.com/Nerdware-LLC/lambda-push-notification-service/commit/09203b7f824b64d535978b8b200213d45cb8831f))


### Features

* **ecr-push:** add ecr-image-push GitHub Action ([c788b55](https://github.com/Nerdware-LLC/lambda-push-notification-service/commit/c788b554a85de159790996d58e50eda419cfd307))
* **release:** add 'npm' plugin to update pkg.json ([3715349](https://github.com/Nerdware-LLC/lambda-push-notification-service/commit/3715349adf248a360c25fc116b770870270c179d))
* **src:** init commit src files ([f280353](https://github.com/Nerdware-LLC/lambda-push-notification-service/commit/f2803537e2014db4096e170ae4166e8e0cdc7947))
* update repo-wide config files and README ([dc0cdf7](https://github.com/Nerdware-LLC/lambda-push-notification-service/commit/dc0cdf79718a2ee6b205c449ed46179401ba7a0b))
