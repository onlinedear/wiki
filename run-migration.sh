#!/bin/bash
cd apps/server
export PATH="/Users/cn-stevenlv/.npm-global/bin:$PATH"
pnpm migration:up
