#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SampleEc2Stack } from '../lib/sampleEc2Stack';
import { getConfig } from '../lib/configUtils';

const app = new cdk.App();
const { stackName, environment } = getConfig(app);

cdk.Tags.of(app).add('app', stackName);
cdk.Tags.of(app).add('env', environment);

const mainStackName = `${stackName}-${environment}`;

new SampleEc2Stack(app, mainStackName, {
  envSuffix: environment,
  logicalIdSegment: 'PkTest'
});
