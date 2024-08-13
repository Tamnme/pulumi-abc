import json

def lambda_handler(event, context):
    for record in event.get('Records', []):
        print('Received message:', record['body'])
    
    message = "Hello, World!"
    print(message)

    return {
        'statusCode': 200,
        'body': json.dumps({'message': message})
    }
