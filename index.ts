import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

//---- Create an S3 bucket
const bucket = new aws.s3.Bucket("myBucket", {
  // Optional bucket configuration
});

//---- Create an SQS queue
const queue = new aws.sqs.Queue("myQueue", {
  // Optional queue configuration
});

//---- Create a Lambda function
// const lambdaRole = new aws.iam.Role("myLambdaRole", {
//   assumeRolePolicy: JSON.stringify({
//       Version: "2012-10-17",
//       Statement: [
//           {
//               Action: "sts:AssumeRole",
//               Effect: "Allow",
//               Principal: {
//                   Service: "lambda.amazonaws.com",
//               },
//           },
//       ],
//   }),
// });

// const lambdaPolicy = new aws.iam.RolePolicy("myLambdaPolicy", {
//   role: lambdaRole.id,
//   policy: JSON.stringify({
//       Version: "2012-10-17",
//       Statement: [
//           {
//               Action: [
//                   "sqs:ReceiveMessage",
//                   "sqs:DeleteMessage",
//                   "sqs:GetQueueAttributes",
//               ],
//               Effect: "Allow",
//               Resource: queue.arn,
//           },
//           {
//               Action: "logs:*",
//               Effect: "Allow",
//               Resource: "*",
//           },
//       ],
//   }),
// });

// const lambda = new aws.lambda.Function("myLambda", {
//   role: lambdaRole.arn,
//   handler: "lambda_function.lambda_handler",
//   runtime: "python3.8",
//   code: new pulumi.asset.FileArchive("./lambda/lambda.zip"),
// });

// Grant the S3 bucket permission to send messages to the SQS queue
const bucketPolicy = new aws.s3.BucketPolicy("myBucketPolicy", {
  bucket: bucket.id,
  policy: pulumi.all([bucket.arn, queue.arn]).apply(([bucketArn, queueArn]) => JSON.stringify({
      Version: "2012-10-17",
      Statement: [
          {
              Action: "sqs:SendMessage",
              Effect: "Allow",
              Resource: queueArn,
              Principal: {
                  Service: "s3.amazonaws.com",
              },
              Condition: {
                  ArnLike: {
                      "aws:SourceArn": bucketArn,
                  },
              },
          },
      ],
  })),
});

// Set up S3 bucket notification to send events to the SQS queue
const bucketNotification = new aws.s3.BucketNotification("myBucketNotification", {
  bucket: bucket.id,
  queues: [{
      events: ["s3:ObjectCreated:*"],
      queueArn: queue.arn,
  }],
});

//---- Set up Lambda function to be triggered by SQS queue
// const eventSourceMapping = new aws.lambda.EventSourceMapping("myEventSourceMapping", {
//   eventSourceArn: queue.arn,
//   functionName: lambda.arn,
//   enabled: true,
// });

export const bucketName = bucket.id;
export const queueUrl = queue.url;
//export const lambdaFunctionName = lambda.name;
