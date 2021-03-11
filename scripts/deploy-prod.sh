#!/bin/bash

# Deploys the app to all SmartThings supported regions
# You will need to change the AWS_PROFILE value to your own profile

export AWS_PROFILE="jodyalbritton"

serverless deploy -s prod -r us-east-1
serverless deploy -s prod -r eu-west-1
serverless deploy -s prod -r ap-northeast-2
