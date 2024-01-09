import * as cdk from 'aws-cdk-lib';
import { BuildConfig } from './buildConfig';

export function getConfig(app: cdk.App) {
  const env = app.node.tryGetContext('config');
  if (!env) throw new Error(`Context variable missing on CDK command`);

  const unparsedEnv = app.node.tryGetContext(env);

  const buildConfig: BuildConfig = {
    stackName: ensureString(unparsedEnv, 'StackName'),
    environment: ensureString(unparsedEnv, 'Environment')
  };

  return buildConfig;
}

function ensureString(
  object: { [name: string]: any },
  propName: string
): string {
  if (!object[propName] || object[propName].trim().length === 0)
    throw new Error(`${propName} does not exist or is empty`);

  return object[propName];
}
