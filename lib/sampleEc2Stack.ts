import * as cdk from 'aws-cdk-lib';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface SampleEc2StackProps extends cdk.StackProps {
  envSuffix?: string;
  logicalIdSegment: string;
}

export class SampleEc2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SampleEc2StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, `${props.logicalIdSegment}Vpc`);

    const securityGroup = new ec2.SecurityGroup(
      this,
      `${props.logicalIdSegment}SecurityGroup`,
      {
        vpc,
        securityGroupName: 'pk-test-sg',
        description: 'Allow all traffic',
        allowAllOutbound: true
      }
    );

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.allTcp(),
      'Allow all inbound traffic'
    );

    const awsAmi = new ec2.AmazonLinuxImage({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2023
    });

    const ec2Instance = new ec2.Instance(
      this,
      `${props.logicalIdSegment}Instance`,
      {
        instanceName: `test-instance-${props.envSuffix}`,
        vpc,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PUBLIC
        },
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          ec2.InstanceSize.NANO
        ),
        machineImage: awsAmi,
        securityGroup: securityGroup
      }
    );

    ec2Instance.addUserData(userDataScript);

    new cdk.CfnOutput(this, 'ipAddress', {
      value: ec2Instance.instancePublicIp,
      description: 'Sample EC2 instance IP address'
    });

    new cdk.CfnOutput(this, 'accountDetails',
    {
      value: `${cdk.Aws.REGION}::${cdk.Aws.ACCOUNT_ID}`,
      description: "testing whether these get populated"
    })
  }
}

const userDataScript = `
#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd
EC2_AVAIL_ZONE=$(curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone)
echo "<h1>Hello World from $(hostname -f) in AZ $EC2_AVAIL_ZONE</h1>" > /var/www/html/index.html
`;
