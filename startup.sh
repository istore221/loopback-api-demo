#!/bin/bash
#  ./startup.sh -e production -p 80
export BUILD_ENV='development'
export PORT=3000

parse_args() {
    case "$1" in
        -e)
            export BUILD_ENV=$2
            ;;
        -p)
            export PORT=$2
            ;;
        *)
            echo "Unknown or badly placed parameter '$1'." 1>&2
            exit 1
            ;;
    esac
}

while [[ "$#" -ge 2 ]]; do
    parse_args "$1" "$2"
    shift; shift
done

export VERSION=$(node -e "console.log(require('./package.json').version)")
docker-compose up -d --build
