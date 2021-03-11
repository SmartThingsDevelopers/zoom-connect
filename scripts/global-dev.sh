#!/bin/bash

# Sets up global replication of DynamoDB tables across all deployed regions of the dev environment.
# This replication is needed since the webhook called by Zoom when presence status
# changes may not be in the same region as the SmartApp lambda

aws dynamodb create-global-table \
    --global-table-name bobs-zoom-connect-dev \
    --replication-group RegionName=us-east-1 RegionName=eu-west-1 \
    --region us-east-1
