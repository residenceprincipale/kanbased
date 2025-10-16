#!/bin/bash

curl -X POST https://api.kanbased.residenceprincipale.net/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -H "Origin: https://kanbased.residenceprincipale.net" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "name": "Test User"
  }' \
  -v

