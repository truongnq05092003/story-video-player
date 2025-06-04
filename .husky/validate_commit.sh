#!/usr/bin/env sh
COMMIT_MSG_PATH=
while getopts "m:" opt
do
   # shellcheck disable=SC2220
   case "$opt" in
      m ) COMMIT_MSG_PATH="$OPTARG" ;;
   esac
done
TYPE="$(cat "$PWD/.husky/metadata/type.txt")"
SERVICE="$(cat "$PWD/.husky/metadata/service.txt")"
ISSUE_CODE="$(cat "$PWD/.husky/metadata/issue_code.txt")"
COMMIT_MSG="$(cat $COMMIT_MSG_PATH)"
valid_commit_regex="^(($TYPE)\(($SERVICE)\): ($ISSUE_CODE(-)[0-9]+|no_issue) [a-zA-Z0-9 \-]+)$"

message="❌ Commit invalid, regex: $valid_commit_regex"

if [[ ! $COMMIT_MSG =~ $valid_commit_regex ]]; then
    echo "$message"
    echo "Eg: feat($SERVICE): "$ISSUE_CODE"-112 test commit"
    exit 1
fi
exit 0