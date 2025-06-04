#!/usr/bin/env sh
local_branch_name="$(git rev-parse --abbrev-ref HEAD)"

TYPE="$(cat "$PWD/.husky/metadata/type.txt")"
SERVICE="$(cat "$PWD/.husky/metadata/service.txt")"
ISSUE_CODE="$(cat "$PWD/.husky/metadata/issue_code.txt")"
valid_branch_regex="^(($TYPE)\(($SERVICE)\)/($ISSUE_CODE(-)[0-9]+(-)|no_issue(-))[a-zA-Z0-9\-]+)$"

message="❌ Branch name invalid, regex: $valid_branch_regex"

if [[ ! $local_branch_name =~ $valid_branch_regex ]]; then
    echo "$message"
    echo "Eg: feat($SERVICE)/"$ISSUE_CODE"-112-test-branch "

    exit 1
fi
exit 0
