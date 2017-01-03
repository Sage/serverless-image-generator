#/bin/bash
usage="$(basename "$0") profile-name rest-api-id resource-id -- updates AWS API Gateway to support binary responses

where:
    profile-name  AWS credentials profile as defined in ~/.aws/credentials
    rest-api-id   The API ID in API Gateway (see URL)
    resource-id   The API Resource ID in API Gateway (see URL)"

if [  $# -le 2 ]
then
	echo "$usage"
	exit 1
fi

aws apigateway update-rest-api --profile $1 --region eu-west-1 --rest-api-id $2 --patch-operations op=add,path=/binaryMediaTypes/application~1octet-stream
aws apigateway update-integration-response --profile $1 --region eu-west-1 --rest-api-id $2 --resource-id $3 --http-method GET --status-code 200 --patch-operations op=replace,path=/contentHandling,value=CONVERT_TO_BINARY

echo "You must redeploy the API for the changes to be made effective"
