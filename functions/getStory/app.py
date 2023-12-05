import json
import boto3
import os

STORY_TABLE_NAME = os.environ['STORY_TABLE_NAME']
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(STORY_TABLE_NAME)

def lambda_handler(event, context):
    storyId = event['pathParameters']['storyId']
    response = table.get_item(Key={'StoryId': storyId})
    story = response.get('Item')

    if story == None:
        return {
            "statusCode": 404,
            "body": json.dumps({
                "message": "Story not found"
            })
        }
    elif story['Status'] != 'COMPLETE':
        return {
            "statusCode": 200,
            "body": json.dumps({
                "status": story['Status']
            })
        }
    else:
        storyText = story['StoryText'].replace('"', '').replace('}','').replace('}','').strip()        
        filename = story['StoryAudioUrl'].split('/')[-1]
        storyAudioUrl = f"/audio/{filename}"
        return {
            "statusCode": 200,
            "body": json.dumps({ 
                "prompt" : story['Prompt'],
                "status": story['Status'],
                "storyText": storyText,
                "storyAudio": storyAudioUrl
            })
        }
    