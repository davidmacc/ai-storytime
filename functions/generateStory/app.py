import json
import boto3
import os

STORY_STATE_MACHINE_ARN = os.environ['STORY_STATE_MACHINE_ARN']
client = boto3.client('stepfunctions')


def lambda_handler(event, context):
    body = json.loads(event['body'])
    prompt = body['prompt']
    llmPrompt = f"\n\nHuman: You are an expert writer. Write a story based on the subject in the <subject></subject> tags. \n<subject>{prompt}</subject>\n Respond in a JSON document format containing a single 'story' property. \n\nAssistant:{{\"story\":"
    response = client.start_execution(
        stateMachineArn=STORY_STATE_MACHINE_ARN,
        input=json.dumps({
            'originalPrompt': prompt,
            'llmPrompt': llmPrompt
        })
    )
    executionId = response['executionArn'].split(':')[-1]

    return {
        "statusCode": 200,
        "body": json.dumps({
            "storyId": executionId
        })
    }
