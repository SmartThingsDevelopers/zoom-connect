#!/bin/bash

# Sets up global replication of DynamoDB tables across all deployed regions.
# This replication is needed since the webhook called by Zoom when presence status
# changes may not be in the same region as the SmartApp lambda

export AWS_PROFILE="STPartnerIntPowerUser"

aws dynamodb create-global-table \
    --global-table-name zoom-connector-prod \
    --replication-group RegionName=us-east-1 RegionName=eu-west-1 RegionName=ap-northeast-2 \
    --region us-east-1

